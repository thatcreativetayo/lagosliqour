import type { ValidationRule } from "./rule";

export const siteSettingsSchema = {
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    { name: "heroHeadline", title: "Hero headline", type: "string", validation: (Rule: ValidationRule) => Rule.required() },
    { name: "heroSubtext", title: "Hero subtext", type: "text", validation: (Rule: ValidationRule) => Rule.required() },
    {
      name: "heroImage",
      title: "Hero image",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", title: "Alt text", type: "string" }],
    },
    {
      name: "featuredWines",
      title: "Featured wines",
      type: "array",
      of: [{ type: "reference", to: [{ type: "wine" }] }],
    },
  ],
};
