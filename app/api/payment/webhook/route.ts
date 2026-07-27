import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import {
  fetchCredoTransaction,
  validateCredoPayment,
  type CredoPaymentData,
} from "@/lib/credo/verify";
import { findOrderByReferenceOrTransRef, type OrderRecord } from "@/lib/orders/lookup";
import { getSiteUrl } from "@/lib/site-url";
import { supabaseServer } from "@/lib/supabase/server";
import { sanityWriteClient } from "@/lib/sanity/write-client";

interface CredoWebhookPayload {
  event?: string;
  data?: CredoPaymentData & {
    businessCode?: string;
  };
}

function verifyWebhookSignature(
  signature: string | null,
  secretKey: string,
  businessCode: string
) {
  if (!signature) {
    return false;
  }

  const expected = createHash("sha512")
    .update(secretKey + businessCode)
    .digest("hex");

  return expected.toLowerCase() === signature.toLowerCase();
}

async function markOrderPaid(order: OrderRecord, transRef: string) {
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
    await supabaseServer
      .from("orders")
      .update({
        status: "confirmed",
        updated_at: paidAt,
      })
      .eq("reference", order.reference);
  }

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
  }).catch((error) => {
    console.error("Webhook confirmation email failed:", error);
  });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CredoWebhookPayload;
    const secretKey = process.env.CREDO_SECRET_KEY;
    const businessCode = payload.data?.businessCode ?? process.env.CREDO_BUSINESS_CODE ?? "";

    if (!secretKey) {
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }

    const signature = request.headers.get("x-credo-signature");
    if (businessCode && !verifyWebhookSignature(signature, secretKey, businessCode)) {
      console.error("Invalid Credo webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = payload.event;
    const data = payload.data;

    if (!event || !data?.transRef) {
      return NextResponse.json({ ok: true });
    }

    if (event !== "transaction.successful") {
      return NextResponse.json({ ok: true });
    }

    const transRef = data.transRef;
    const businessRef = data.businessRef;
    let order = await findOrderByReferenceOrTransRef(businessRef, transRef);

    let paymentData = data;

    if (!order || order.paymentStatus !== "paid") {
      const verified = await fetchCredoTransaction(transRef);
      if (verified.ok) {
        paymentData = verified.paymentData;
        order =
          order ??
          (await findOrderByReferenceOrTransRef(
            paymentData.businessRef ?? businessRef,
            transRef
          ));
      }
    }

    if (!order) {
      console.error("Webhook order not found:", { businessRef, transRef });
      return NextResponse.json({ ok: true });
    }

    if (order.paymentStatus === "paid") {
      return NextResponse.json({ ok: true });
    }

    const validation = validateCredoPayment(
      paymentData,
      order.total,
      order.paymentAmountKobo
    );

    if (!validation.isPaid) {
      console.error("Webhook payment validation failed:", {
        reference: order.reference,
        transRef,
        ...validation.checks,
      });
      return NextResponse.json({ ok: true });
    }

    await markOrderPaid(order, transRef);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Credo webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
