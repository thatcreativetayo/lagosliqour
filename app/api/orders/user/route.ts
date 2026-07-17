import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { groq, sanityFetch } from "@/lib/sanity/client";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const orders = await sanityFetch({
      query: groq`*[_type == "order" && customerEmail == $email] | order(orderDate desc) {
        "id": _id,
        reference,
        status,
        "customer_name": customerName,
        "customer_email": customerEmail,
        "customer_phone": customerPhone,
        "state": deliveryAddress.state,
        "city": deliveryAddress.city,
        "street_address": deliveryAddress.streetAddress,
        "landmark": deliveryAddress.landmark,
        "delivery_notes": deliveryNotes,
        subtotal,
        "delivery_fee": deliveryFee,
        total,
        items,
        "created_at": orderDate
      }`,
      params: { email },
      revalidate: 0,
    });

    return NextResponse.json({ orders: orders || [] });
  } catch (error) {
    console.error("Orders API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
