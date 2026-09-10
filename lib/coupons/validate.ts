import { sanityWriteClient } from "@/lib/sanity/write-client";

export interface CouponDoc {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  percentage?: number;
  amount?: number;
  active?: boolean;
  expiresAt?: string;
  minOrderValue?: number;
  usageLimit?: number;
  usedCount?: number;
}

export interface CouponValidationSuccess {
  valid: true;
  coupon: CouponDoc;
  /** Normalized code as stored (for display / persistence). */
  code: string;
  /** Naira discount applied to the subtotal, rounded and capped at subtotal. */
  discount: number;
  /** Human-friendly label, e.g. "15% off" or "₦5,000 off". */
  label: string;
}

export interface CouponValidationFailure {
  valid: false;
  message: string;
}

export type CouponValidationResult = CouponValidationSuccess | CouponValidationFailure;

// Fetch by case-insensitive code match. lower() is supported on the dataset.
const couponByCodeQuery = `*[_type == "coupon" && lower(code) == $code][0]{
  _id, code, discountType, percentage, amount, active, expiresAt,
  minOrderValue, usageLimit, usedCount
}`;

function computeDiscount(coupon: CouponDoc, subtotal: number): number {
  const raw =
    coupon.discountType === "fixed"
      ? coupon.amount ?? 0
      : (subtotal * (coupon.percentage ?? 0)) / 100;

  // Never discount more than the subtotal, and keep it a whole naira value.
  return Math.max(0, Math.min(Math.round(raw), subtotal));
}

function discountLabel(coupon: CouponDoc): string {
  return coupon.discountType === "fixed"
    ? `₦${(coupon.amount ?? 0).toLocaleString()} off`
    : `${coupon.percentage ?? 0}% off`;
}

/**
 * Server-side coupon validation. This is the single source of truth for whether
 * a coupon applies and how much it discounts — used both by the checkout preview
 * route and by order creation, so the amount charged can't be tampered with.
 */
export async function validateCoupon(
  rawCode: string,
  subtotal: number
): Promise<CouponValidationResult> {
  const code = (rawCode ?? "").trim().toLowerCase();

  if (!code) {
    return { valid: false, message: "Enter a coupon code." };
  }

  if (!Number.isFinite(subtotal) || subtotal <= 0) {
    return { valid: false, message: "Add items to your cart first." };
  }

  let coupon: CouponDoc | null;
  try {
    coupon = await sanityWriteClient.fetch<CouponDoc | null>(couponByCodeQuery, { code });
  } catch (error) {
    console.error("Coupon lookup failed:", error);
    return { valid: false, message: "Could not check that coupon. Please try again." };
  }

  if (!coupon) {
    return { valid: false, message: "That coupon code is not valid." };
  }

  if (coupon.active === false) {
    return { valid: false, message: "This coupon is no longer active." };
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    return { valid: false, message: "This coupon has expired." };
  }

  if (
    typeof coupon.usageLimit === "number" &&
    typeof coupon.usedCount === "number" &&
    coupon.usedCount >= coupon.usageLimit
  ) {
    return { valid: false, message: "This coupon has reached its usage limit." };
  }

  if (typeof coupon.minOrderValue === "number" && subtotal < coupon.minOrderValue) {
    return {
      valid: false,
      message: `Spend at least ₦${coupon.minOrderValue.toLocaleString()} to use this coupon.`,
    };
  }

  const discount = computeDiscount(coupon, subtotal);

  if (discount <= 0) {
    return { valid: false, message: "This coupon has no discount value." };
  }

  return {
    valid: true,
    coupon,
    code: coupon.code,
    discount,
    label: discountLabel(coupon),
  };
}
