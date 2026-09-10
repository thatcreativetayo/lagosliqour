import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { supabaseServer } from "@/lib/supabase/server";
import { sanityWriteClient } from "@/lib/sanity/write-client";
import { validateCoupon } from "@/lib/coupons/validate";
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
  couponCode?: string;
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

    // Re-derive money server-side. Never trust the client's total: the payment
    // amount is validated against order.total later (lib/credo/verify.ts), so a
    // forged discount here would let someone underpay.
    const subtotal = Number(body.subtotal) || 0;
    const deliveryFee = Number(body.deliveryFee) || 0;

    let appliedCouponCode: string | undefined;
    let discount = 0;
    let couponId: string | undefined;

    if (body.couponCode) {
      const result = await validateCoupon(body.couponCode, subtotal);
      if (result.valid) {
        discount = result.discount;
        appliedCouponCode = result.code;
        couponId = result.coupon._id;
      }
      // If invalid (expired/limit reached between preview and submit) we simply
      // ignore it rather than failing the order — the customer pays full price.
    }

    const total = Math.max(0, subtotal - discount) + deliveryFee;

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
        _type: "orderItem",
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
      subtotal,
      ...(appliedCouponCode ? { couponCode: appliedCouponCode, discount } : {}),
      deliveryFee,
      total,
      paymentMethod: body.paymentMethod ?? "transfer",
      orderDate,
    };

    try {
      const createdOrder = await sanityWriteClient.create(sanityOrder);

      // Count the redemption. Best-effort + atomic (inc), so it never blocks the
      // order and concurrent orders don't clobber each other's count.
      if (couponId) {
        try {
          await sanityWriteClient
            .patch(couponId)
            .setIfMissing({ usedCount: 0 })
            .inc({ usedCount: 1 })
            .commit();
        } catch (couponError) {
          console.error("Failed to increment coupon usage:", couponError);
        }
      }

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
              subtotal,
              delivery_fee: deliveryFee,
              total,
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
        subtotal,
        discount,
        deliveryFee,
        total,
        couponCode: appliedCouponCode ?? null,
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
            subtotal,
            delivery_fee: deliveryFee,
            total,
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
          subtotal,
          discount,
          deliveryFee,
          total,
          couponCode: appliedCouponCode ?? null,
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
