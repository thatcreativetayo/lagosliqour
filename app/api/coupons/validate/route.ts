import { NextResponse } from "next/server";
import { validateCoupon } from "@/lib/coupons/validate";

interface ValidateCouponRequest {
  code?: string;
  subtotal?: number;
}

// Preview a coupon for the checkout UI. This does NOT reserve or consume the
// coupon — the authoritative check + usage increment happens in /api/orders
// when the order is actually created.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ValidateCouponRequest;
    const result = await validateCoupon(body.code ?? "", Number(body.subtotal));

    if (!result.valid) {
      return NextResponse.json({ valid: false, message: result.message }, { status: 200 });
    }

    return NextResponse.json({
      valid: true,
      code: result.code,
      discount: result.discount,
      label: result.label,
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      { valid: false, message: "Could not check that coupon. Please try again." },
      { status: 200 }
    );
  }
}
