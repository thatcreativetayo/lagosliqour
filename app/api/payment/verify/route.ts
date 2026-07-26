import { NextResponse } from "next/server";
import { findOrderByReferenceOrTransRef, type OrderRecord } from "@/lib/orders/lookup";
import { getSiteUrl } from "@/lib/site-url";
import { supabaseServer } from "@/lib/supabase/server";
import { sanityWriteClient } from "@/lib/sanity/write-client";

const defaultCredoBaseUrl = "https://api.credocentral.com";

interface CredoPaymentData {
  transRef?: string;
  businessRef?: string;
  reference?: string;
  transAmount?: number;
  amount?: number;
  currencyCode?: string;
  currency?: string;
  status?: number | string;
}

function getFirstParam(searchParams: URLSearchParams, names: string[]) {
  for (const name of names) {
    const value = searchParams.get(name);
    if (value) return value;
  }

  return null;
}

function isSuccessfulCredoStatus(status: unknown) {
  return status === 0 || status === "0";
}

function normalizeAmount(amount: unknown) {
  const value = Number(amount);
  return Number.isFinite(value) ? Math.round(value) : NaN;
}

async function fetchCredoTransaction(transRef: string) {
  const credoSecretKey = process.env.CREDO_SECRET_KEY;
  const credoBaseUrl = process.env.CREDO_BASE_URL ?? defaultCredoBaseUrl;

  if (!credoSecretKey) {
    return { ok: false as const, status: 500, error: "Payment gateway not configured" };
  }

  const response = await fetch(`${credoBaseUrl}/transaction/${transRef}/verify`, {
    method: "GET",
    headers: {
      Authorization: credoSecretKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Credo verification error:", response.status, errorText);
    return {
      ok: false as const,
      status: response.status,
      error: "Payment verification failed",
    };
  }

  const data = await response.json();
  return {
    ok: true as const,
    payload: data,
    paymentData: (data.data ?? {}) as CredoPaymentData,
  };
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
      const businessRef = paymentData.businessRef ?? paymentData.reference ?? callbackReference;

      if (businessRef) {
        order = await findOrderByReferenceOrTransRef(businessRef, transRef);
      }
    }

    if (!order) {
      console.error("Order not found during payment verification:", {
        callbackReference,
        callbackTransRef,
        businessRefFromGateway: paymentData?.businessRef ?? paymentData?.reference,
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

    transRef = transRef ?? order.credoReference ?? null;

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

    const expectedAmount = normalizeAmount(order.total * 100);
    const actualAmount = normalizeAmount(paymentData.transAmount ?? paymentData.amount);
    const gatewayReference = paymentData.businessRef ?? paymentData.reference;
    const currencyCode = paymentData.currencyCode ?? paymentData.currency;
    const isPaid =
      isSuccessfulCredoStatus(paymentData.status) &&
      gatewayReference === order.reference &&
      currencyCode === "NGN" &&
      actualAmount === expectedAmount;

    if (isPaid) {
      return markOrderPaid(order, transRef, paymentData);
    }

    console.error("Credo verification mismatch:", {
      reference: order.reference,
      transRef,
      gatewayReference,
      expectedAmount,
      actualAmount,
      currencyCode,
      paymentStatus: paymentData.status,
    });

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
      message: "Payment was not successful",
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
