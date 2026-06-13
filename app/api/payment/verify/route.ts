import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    // Validate environment variables at runtime
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase configuration");
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "Missing payment reference" },
        { status: 400 }
      );
    }

    const credoSecretKey = process.env.CREDO_SECRET_KEY;

    if (!credoSecretKey) {
      return NextResponse.json(
        { error: "Payment gateway not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.credocentral.com/transaction/${reference}/verify`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${credoSecretKey}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Credo verification error:", errorText);
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (data.status === "PAID") {
      // Update order status to confirmed
      const { data: orderData, error: updateError } = await supabaseServer
        .from("orders")
        .update({
          status: "confirmed",
          updated_at: new Date().toISOString(),
        })
        .eq("reference", reference)
        .select()
        .single();

      if (updateError) {
        console.error("Failed to update order status:", updateError);
        return NextResponse.json(
          { error: "Failed to update order" },
          { status: 500 }
        );
      }

      // Send confirmation emails
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-order-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reference: orderData.reference,
            customerName: orderData.customer_name,
            customerEmail: orderData.customer_email,
            customerPhone: orderData.customer_phone,
            state: orderData.state,
            city: orderData.city,
            streetAddress: orderData.street_address,
            landmark: orderData.landmark,
            items: orderData.items,
            subtotal: orderData.subtotal,
            deliveryFee: orderData.delivery_fee,
            total: orderData.total,
            createdAt: orderData.created_at,
          }),
        });
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // Don't fail the request if email fails
      }

      return NextResponse.json({
        status: "success",
        reference,
        data: data.data,
      });
    }

    return NextResponse.json({
      status: "failed",
      reference,
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
