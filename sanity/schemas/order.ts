import { defineField, defineType } from "sanity";

export const orderSchema = defineType({
  name: "order",
  title: "Orders",
  type: "document",
  fields: [
    defineField({
      name: "reference",
      title: "Order Reference",
      type: "string",
      validation: (Rule) => Rule.required(),
      readOnly: true,
    }),
    defineField({
      name: "status",
      title: "Order Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Confirmed", value: "confirmed" },
          { title: "Processing", value: "processing" },
          { title: "Shipped", value: "shipped" },
          { title: "Delivered", value: "delivered" },
          { title: "Cancelled", value: "cancelled" },
          { title: "Failed", value: "failed" },
        ],
        layout: "dropdown",
      },
      initialValue: "pending",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "customerName",
      title: "Customer Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "customerEmail",
      title: "Customer Email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "customerPhone",
      title: "Customer Phone",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "deliveryAddress",
      title: "Delivery Address",
      type: "object",
      fields: [
        { name: "streetAddress", title: "Street Address", type: "string" },
        { name: "landmark", title: "Landmark", type: "string" },
        { name: "city", title: "City", type: "string" },
        { name: "state", title: "State", type: "string" },
      ],
    }),
    defineField({
      name: "deliveryNotes",
      title: "Delivery Notes",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "items",
      title: "Order Items",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "wineId", title: "Wine ID", type: "string" },
            { name: "slug", title: "Slug", type: "string" },
            { name: "title", title: "Product Name", type: "string" },
            { name: "image", title: "Image URL", type: "url" },
            { name: "quantity", title: "Quantity", type: "number" },
            { name: "unitPrice", title: "Unit Price", type: "number" },
            { name: "lineTotal", title: "Line Total", type: "number" },
          ],
          preview: {
            select: {
              title: "title",
              quantity: "quantity",
              total: "lineTotal",
            },
            prepare({ title, quantity, total }) {
              return {
                title: title || "Unnamed Item",
                subtitle: `Qty: ${quantity} - ₦${total?.toLocaleString()}`,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "subtotal",
      title: "Subtotal",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "deliveryFee",
      title: "Delivery Fee",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "total",
      title: "Total Amount",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "paymentMethod",
      title: "Payment Method",
      type: "string",
      options: {
        list: [
          { title: "Bank Transfer", value: "transfer" },
          { title: "Online Payment", value: "online" },
        ],
      },
    }),
    defineField({
      name: "orderDate",
      title: "Order Date",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "notes",
      title: "Internal Notes",
      type: "text",
      rows: 4,
      description: "Private notes for store management",
    }),
  ],
  preview: {
    select: {
      reference: "reference",
      customerName: "customerName",
      total: "total",
      status: "status",
      date: "orderDate",
    },
    prepare({ reference, customerName, total, status, date }) {
      return {
        title: reference || "Order",
        subtitle: `${customerName} - ₦${total?.toLocaleString()} - ${status}`,
        description: date ? new Date(date).toLocaleDateString("en-NG") : "",
      };
    },
  },
  orderings: [
    {
      title: "Order Date, New",
      name: "orderDateDesc",
      by: [{ field: "orderDate", direction: "desc" }],
    },
    {
      title: "Order Date, Old",
      name: "orderDateAsc",
      by: [{ field: "orderDate", direction: "asc" }],
    },
    {
      title: "Total Amount",
      name: "totalDesc",
      by: [{ field: "total", direction: "desc" }],
    },
  ],
});
