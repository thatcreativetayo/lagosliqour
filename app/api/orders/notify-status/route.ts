import { NextResponse } from "next/server";
import { Resend } from "resend";
import { sanityWriteClient } from "@/lib/sanity/write-client";
import { statusEmail, type StatusEmailOrder } from "@/lib/email/status-templates";

const orderQuery = `*[_type == "order" && _id == $id][0]{
  _id,
  reference,
  status,
  customerName,
  customerEmail,
  total,
  deliveryAddress,
  lastNotifiedStatus
}`;

export async function POST(request: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 503 }
      );
    }

    const { orderId } = (await request.json()) as { orderId?: string };
    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    // Re-fetch the order from Sanity so we email the saved status/recipient,
    // never values supplied by the client.
    const order = await sanityWriteClient.fetch<
      (StatusEmailOrder & { _id: string; lastNotifiedStatus?: string }) | null
    >(orderQuery, { id: orderId });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!order.customerEmail) {
      return NextResponse.json(
        { error: "Order has no customer email" },
        { status: 422 }
      );
    }

    const email = statusEmail(order.status, order);
    if (!email) {
      // pending / cancelled / failed etc. — nothing to send.
      return NextResponse.json({ skipped: true, status: order.status });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "Lagos Liquor <orders@lagosliquor.com>",
      to: order.customerEmail,
      subject: email.subject,
      html: email.html,
    });

    if (result.error) {
      console.error("Status email send failed:", result.error);
      return NextResponse.json(
        { error: "Failed to send email", message: result.error.message },
        { status: 502 }
      );
    }

    // Record what we sent so the Studio action can warn on duplicates.
    await sanityWriteClient
      .patch(order._id)
      .set({
        lastNotifiedStatus: order.status,
        lastNotifiedAt: new Date().toISOString(),
      })
      .commit();

    return NextResponse.json({
      success: true,
      status: order.status,
      emailId: result.data?.id,
    });
  } catch (error) {
    console.error("notify-status error:", error);
    return NextResponse.json(
      {
        error: "Failed to notify customer",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
