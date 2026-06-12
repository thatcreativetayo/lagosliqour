import type { ValidationRule } from "./rule";

export const wineCategorySchema = {
  name: "wineCategory",
  title: "Wine Category",
  type: "document",
  fields: [
    { name: "title", title: "Title", type: "string", validation: (Rule: ValidationRule) => Rule.required() },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule: ValidationRule) => Rule.required(),
    },
    { name: "description", title: "Description", type: "text" },
    {
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", title: "Alt text", type: "string" }],
    },
  ],
};
