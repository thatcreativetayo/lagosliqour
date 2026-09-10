import { defineField, defineType } from "sanity";

export const couponSchema = defineType({
  name: "coupon",
  title: "Coupons",
  type: "document",
  fields: [
    defineField({
      name: "code",
      title: "Coupon Code",
      type: "string",
      description: "What the customer types at checkout, e.g. WELCOME10. Case-insensitive.",
      validation: (Rule) => Rule.required().min(3).max(24),
    }),
    defineField({
      name: "discountType",
      title: "Discount Type",
      type: "string",
      options: {
        list: [
          { title: "Percentage (%)", value: "percentage" },
          { title: "Fixed amount (₦)", value: "fixed" },
        ],
        layout: "radio",
      },
      initialValue: "percentage",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "percentage",
      title: "Percent Off",
      type: "number",
      description: "e.g. 15 for 15% off the subtotal.",
      hidden: ({ parent }) => parent?.discountType !== "percentage",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { discountType?: string };
          if (parent?.discountType !== "percentage") return true;
          if (typeof value !== "number") return "Enter a percentage";
          if (value <= 0 || value > 100) return "Must be between 1 and 100";
          return true;
        }),
    }),
    defineField({
      name: "amount",
      title: "Amount Off (₦)",
      type: "number",
      description: "Fixed naira amount off the subtotal.",
      hidden: ({ parent }) => parent?.discountType !== "fixed",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { discountType?: string };
          if (parent?.discountType !== "fixed") return true;
          if (typeof value !== "number") return "Enter an amount";
          if (value <= 0) return "Must be greater than 0";
          return true;
        }),
    }),
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      initialValue: true,
      description: "Turn off to pause this coupon without deleting it.",
    }),
    defineField({
      name: "expiresAt",
      title: "Expires At",
      type: "datetime",
      description: "Optional. The coupon stops working after this date.",
    }),
    defineField({
      name: "minOrderValue",
      title: "Minimum Order (₦)",
      type: "number",
      description: "Optional. Minimum product subtotal required to use this coupon.",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "usageLimit",
      title: "Usage Limit",
      type: "number",
      description: "Optional. Maximum number of times this coupon can be used in total.",
      validation: (Rule) => Rule.integer().min(1),
    }),
    defineField({
      name: "usedCount",
      title: "Times Used",
      type: "number",
      initialValue: 0,
      readOnly: true,
      description: "Increments automatically each time the coupon is used on an order.",
    }),
  ],
  preview: {
    select: {
      code: "code",
      type: "discountType",
      pct: "percentage",
      amt: "amount",
      active: "active",
    },
    prepare({ code, type, pct, amt, active }) {
      const value = type === "fixed" ? `₦${(amt ?? 0).toLocaleString()} off` : `${pct ?? 0}% off`;
      return {
        title: code || "Coupon",
        subtitle: `${value}${active === false ? " · inactive" : ""}`,
      };
    },
  },
});
