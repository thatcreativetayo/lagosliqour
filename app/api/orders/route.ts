import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { supabaseServer } from "@/lib/supabase/server";
import { sanityWriteClient } from "@/lib/sanity/write-client";
import type { CartItem } from "@/lib/stores/cart";

export interface CreateOrderRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  state: string;
  city: string;
  streetAddress: string;
  landmark?: string;
  deliveryNotes?: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export async function POST(request: Request) {
  try {
    // Validate environment variables at runtime
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase configuration");
      return NextResponse.json({ 
        error: "Service unavailable - Database not configured",
        details: "Please configure SUPABASE environment variables"
      }, { status: 503 });
    }

    const body = (await request.json()) as CreateOrderRequest;

    // Generate reference in format: LLORDER + timestamp + random
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0'); // 2 random digits
    const reference = `LLORDER${timestamp}${random}`;

    // Create order in Supabase
    const { data, error } = await supabaseServer
      .from("orders")
      .insert({
        reference,
        status: "pending",
        customer_name: body.customerName,
        customer_email: body.customerEmail,
        customer_phone: body.customerPhone,
        state: body.state,
        city: body.city,
        street_address: body.streetAddress,
        landmark: body.landmark,
        delivery_notes: body.deliveryNotes,
        subtotal: body.subtotal,
        delivery_fee: body.deliveryFee,
        total: body.total,
        items: body.items,
      })
      .select("id, reference")
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ 
        error: "Failed to create order",
        details: error.message 
      }, { status: 500 });
    }

    // Also create order in Sanity for owner management
    try {
      await sanityWriteClient.create({
        _type: "order",
        reference: data.reference,
        status: "pending",
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        deliveryAddress: {
          streetAddress: body.streetAddress,
          landmark: body.landmark,
          city: body.city,
          state: body.state,
        },
        deliveryNotes: body.deliveryNotes,
        items: body.items.map(item => ({
          _type: "object",
          _key: nanoid(),
          wineId: item.wineId,
          slug: item.slug,
          title: item.title,
          image: item.image,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
        })),
        subtotal: body.subtotal,
        deliveryFee: body.deliveryFee,
        total: body.total,
        paymentMethod: "transfer",
        orderDate: new Date().toISOString(),
      });
      console.log("Order synced to Sanity:", data.reference);
    } catch (sanityError) {
      console.error("Failed to sync order to Sanity:", sanityError);
      // Don't fail the request if Sanity sync fails
    }

    return NextResponse.json({
      orderId: data.id,
      reference: data.reference,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
