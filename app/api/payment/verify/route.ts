import { NextResponse } from "next/server";
import {
  fetchCredoTransaction,
  getFailureMessage,
  isFailedCredoStatus,
  isPendingCredoStatus,
  validateCredoPayment,
  type CredoPaymentData,
} from "@/lib/credo/verify";
import { findOrderByReferenceOrTransRef, type OrderRecord } from "@/lib/orders/lookup";
import { getSiteUrl } from "@/lib/site-url";
import { supabaseServer } from "@/lib/supabase/server";
import { sanityWriteClient } from "@/lib/sanity/write-client";

function getFirstParam(searchParams: URLSearchParams, names: string[]) {
  for (const name of names) {
    const value = searchParams.get(name);
    if (value) return value;
  }

  return null;
}

async function markOrderPaid(order: OrderRecord, transRef: string, paymentData: CredoPaymentData) {
  const paidAt = new Date().toISOString();

  if (order.orderStore === "sanity") {
    await sanityWriteClient
      .patch(order._id)
      .set({
        status: "confirmed",
        paymentStatus: "paid",
        credoReference: transRef,
        paidAt,
      })
      .commit();
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { error: updateError } = await supabaseServer
      .from("orders")
      .update({
        status: "confirmed",
        updated_at: paidAt,
      })
      .eq("reference", order.reference);

    if (updateError) {
      console.error("Failed to update Supabase backup order:", updateError);
    }
  }

  try {
    await fetch(`${getSiteUrl()}/api/orders/send-confirmation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference: order.reference,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        deliveryAddress: {
          street: order.deliveryAddress?.streetAddress ?? "",
          landmark: order.deliveryAddress?.landmark,
          city: order.deliveryAddress?.city ?? "",
          state: order.deliveryAddress?.state ?? "",
        },
        items: order.items,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        total: order.total,
        createdAt: order.orderDate,
      }),
    });
  } catch (emailError) {
    console.error("Failed to send confirmation email:", emailError);
  }

  return NextResponse.json({
    status: "success",
    reference: order.reference,
    data: paymentData,
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const callbackReference = getFirstParam(searchParams, [
      "reference",
      "businessRef",
      "business_ref",
    ]);
    const callbackTransRef = getFirstParam(searchParams, [
      "transRef",
      "transref",
      "credoReference",
      "credo_reference",
    ]);

    if (!callbackReference && !callbackTransRef) {
      return NextResponse.json(
        { error: "Missing payment reference" },
        { status: 400 }
      );
    }

    let order = await findOrderByReferenceOrTransRef(callbackReference, callbackTransRef);
    let paymentData: CredoPaymentData | null = null;
    let transRef = callbackTransRef ?? order?.credoReference ?? null;

    if (!order && transRef) {
      const credoResult = await fetchCredoTransaction(transRef);

      if (!credoResult.ok) {
        return NextResponse.json(
          {
            error: credoResult.error,
            statusCode: credoResult.status,
          },
          { status: credoResult.status === 500 ? 500 : 502 }
        );
      }

      paymentData = credoResult.paymentData;
      const businessRef = paymentData.businessRef ?? callbackReference;

      if (businessRef) {
        order = await findOrderByReferenceOrTransRef(businessRef, transRef);
      }
    }

    if (!order) {
      console.error("Order not found during payment verification:", {
        callbackReference,
        callbackTransRef,
        businessRefFromGateway: paymentData?.businessRef,
      });

      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.paymentStatus === "paid") {
      return NextResponse.json({
        status: "success",
        reference: order.reference,
        alreadyProcessed: true,
      });
    }

    transRef = transRef ?? order.credoReference ?? paymentData?.transRef ?? null;

    if (!transRef) {
      return NextResponse.json(
        { error: "Payment transaction reference not ready. Please try again shortly." },
        { status: 409 }
      );
    }

    if (!paymentData) {
      const credoResult = await fetchCredoTransaction(transRef);

      if (!credoResult.ok) {
        return NextResponse.json(
          {
            error: credoResult.error,
            statusCode: credoResult.status,
          },
          { status: credoResult.status === 500 ? 500 : 502 }
        );
      }

      paymentData = credoResult.paymentData;
    }

    const validation = validateCredoPayment(
      paymentData,
      order.total,
      order.paymentAmountKobo
    );

    if (validation.isPaid) {
      return markOrderPaid(order, transRef, paymentData);
    }

    console.error("Credo verification mismatch:", {
      reference: order.reference,
      transRef,
      ...validation.checks,
      paymentData,
    });

    if (validation.isPending || isPendingCredoStatus(paymentData.status)) {
      return NextResponse.json({
        status: "pending",
        reference: order.reference,
        message: "Payment is still processing. Please wait a moment and refresh this page.",
      });
    }

    if (validation.isFailed || isFailedCredoStatus(paymentData.status)) {
      if (order.orderStore === "sanity") {
        await sanityWriteClient
          .patch(order._id)
          .set({
            paymentStatus: "failed",
            credoReference: transRef,
          })
          .commit();
      }

      return NextResponse.json({
        status: "failed",
        reference: order.reference,
        message: getFailureMessage(validation.checks),
      });
    }

    return NextResponse.json({
      status: "pending",
      reference: order.reference,
      message: getFailureMessage(validation.checks),
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
