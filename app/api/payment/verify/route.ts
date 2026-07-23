import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { groq, sanityFetch } from "@/lib/sanity/client";
import { sanityWriteClient } from "@/lib/sanity/write-client";

interface SanityOrder {
  _id: string;
  reference: string;
  credoReference?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress?: {
    streetAddress?: string;
    landmark?: string;
    city?: string;
    state?: string;
  };
  items: unknown[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  orderDate: string;
  paymentStatus?: string;
}

const defaultCredoBaseUrl = "https://api.credocentral.com";

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

    const credoSecretKey = process.env.CREDO_SECRET_KEY;
    const credoBaseUrl = process.env.CREDO_BASE_URL ?? defaultCredoBaseUrl;

    if (!credoSecretKey) {
      return NextResponse.json(
        { error: "Payment gateway not configured" },
        { status: 500 }
      );
    }

    const order = await sanityFetch<SanityOrder | null>({
      query: groq`*[_type == "order" && (
        reference == $reference ||
        credoReference == $transRef
      )][0]{
        _id,
        reference,
        credoReference,
        customerName,
        customerEmail,
        customerPhone,
        deliveryAddress,
        items,
        subtotal,
        deliveryFee,
        total,
        orderDate,
        paymentStatus
      }`,
      params: {
        reference: callbackReference ?? "",
        transRef: callbackTransRef ?? "",
      },
      revalidate: 0,
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const transRef = callbackTransRef ?? order.credoReference;

    if (order.paymentStatus === "paid") {
      return NextResponse.json({
        status: "success",
        reference: order.reference,
        alreadyProcessed: true,
      });
    }

    if (!transRef) {
      return NextResponse.json(
        { error: "Payment transaction reference not ready. Please try again shortly." },
        { status: 409 }
      );
    }

    const response = await fetch(
      `${credoBaseUrl}/transaction/${transRef}/verify`,
      {
        method: "GET",
        headers: {
          Authorization: credoSecretKey,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Credo verification error:", response.status, errorText);
      return NextResponse.json(
        {
          error: "Payment verification failed",
          statusCode: response.status,
        },
        { status: 502 }
      );
    }

    const data = await response.json();
    const paymentData = data.data ?? {};
    const expectedAmount = normalizeAmount(order.total);
    const actualAmount = normalizeAmount(paymentData.transAmount ?? paymentData.amount);
    const gatewayReference = paymentData.businessRef ?? paymentData.reference;
    const currencyCode = paymentData.currencyCode ?? paymentData.currency;
    const isPaid =
      data.status === 200 &&
      isSuccessfulCredoStatus(paymentData.status) &&
      gatewayReference === order.reference &&
      currencyCode === "NGN" &&
      actualAmount === expectedAmount;

    if (isPaid) {
      // Update order status to confirmed
      const paidAt = new Date().toISOString();

      await sanityWriteClient
        .patch(order._id)
        .set({
          status: "confirmed",
          paymentStatus: "paid",
          credoReference: transRef,
          paidAt,
        })
        .commit();

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

      // Send confirmation emails
      try {
        await fetch(`https://lagosliquor.com/api/orders/send-confirmation`, {
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
        // Don't fail the request if email fails
      }

      return NextResponse.json({
        status: "success",
        reference: order.reference,
        data: paymentData,
      });
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

    await sanityWriteClient
      .patch(order._id)
      .set({
        paymentStatus: "failed",
        credoReference: transRef,
      })
      .commit();

    return NextResponse.json({
      status: "failed",
      reference: order.reference,
      message: data.message || "Payment was not successful",
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
