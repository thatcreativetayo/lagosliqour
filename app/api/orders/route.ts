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
  paymentMethod?: "online" | "transfer";
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateOrderRequest;

    // Generate reference in format: LLORDER + timestamp + random
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0'); // 2 random digits
    const reference = `LLORDER${timestamp}${random}`;
    const orderDate = new Date().toISOString();
    const sanityOrder = {
      _type: "order",
      reference,
      status: "pending",
      paymentStatus: "pending",
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
      items: body.items.map((item) => ({
        _type: "object",
        _key: nanoid(),
        wineId: item.wineId,
        slug: item.slug,
        title: item.title,
        image: item.image,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
        packSize: item.packSize,
      })),
      subtotal: body.subtotal,
      deliveryFee: body.deliveryFee,
      total: body.total,
      paymentMethod: body.paymentMethod ?? "transfer",
      orderDate,
    };

    try {
      const createdOrder = await sanityWriteClient.create(sanityOrder);

      try {
        if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
          const { error } = await supabaseServer
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
            });

          if (error) {
            console.error("Supabase backup order write failed:", error);
          }
        }
      } catch (supabaseError) {
        console.error("Supabase backup order write failed:", supabaseError);
      }

      return NextResponse.json({
        orderId: createdOrder._id,
        reference,
        orderStore: "sanity",
      });
    } catch (sanityError) {
      console.error("Sanity order create failed:", sanityError);

      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json({
          error: "Sanity order write failed",
          details: getErrorMessage(sanityError),
          setup: "Create a Sanity API token with Editor permissions and set SANITY_API_WRITE_TOKEN.",
        }, { status: 503 });
      }

      try {
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
          return NextResponse.json({
            error: "Order write failed",
            details: error.message,
            sanityDetails: getErrorMessage(sanityError),
            setup: "Sanity token needs create permission. Supabase fallback also failed.",
          }, { status: 500 });
        }

        return NextResponse.json({
          orderId: data.id,
          reference: data.reference,
          orderStore: "supabase",
          warning: "Order was saved to Supabase because Sanity write permissions failed.",
        });
      } catch (supabaseError) {
        return NextResponse.json({
          error: "Order write failed",
          details: getErrorMessage(supabaseError),
          sanityDetails: getErrorMessage(sanityError),
          setup: "Sanity token needs create permission. Supabase fallback also failed.",
        }, { status: 500 });
      }
    }
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: getErrorMessage(error)
    }, { status: 500 });
  }
}
