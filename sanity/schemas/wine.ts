import type { ValidationRule } from "./rule";

export const wineSchema = {
  name: "wine",
  title: "Product",
  type: "document",
  fields: [
    { name: "title", title: "Product name", type: "string" },
    { name: "name", title: "Name alias", type: "string", description: "Optional alias for integrations that expect name." },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
    },
    { name: "price", title: "Price (NGN)", type: "number", validation: (Rule: ValidationRule) => Rule.min(0) },
    { name: "comparePrice", title: "Compare price", type: "number", validation: (Rule: ValidationRule) => Rule.min(0) },
    { name: "description", title: "Description", type: "text" },
    {
      name: "tastingNotes",
      title: "Tasting notes",
      type: "array",
      of: [{ type: "string" }],
    },
    { name: "origin", title: "Origin", type: "string" },
    { name: "region", title: "Region", type: "string", description: "Backward-compatible display field. For spirits, use the same value as origin." },
    { name: "abv", title: "ABV", type: "string" },
    { name: "alcoholContent", title: "Alcohol content", type: "string", description: "Backward-compatible alias for ABV." },
    { name: "age", title: "Age / maturation", type: "string", description: "Example: 7 months, 14 months, 2+ years, unaged." },
    { name: "vintage", title: "Vintage / release year", type: "number", description: "Use the current catalog year for non-vintage spirits.", validation: (Rule: ValidationRule) => Rule.integer() },
    { name: "grapeVariety", title: "Variety / spirit type", type: "string", description: "Example: 100% Blue Weber Agave tequila." },
    { name: "bottleSize", title: "Bottle size", type: "string" },
    {
      name: "bottleImage",
      title: "Primary bottle image",
      type: "image",
      description: "Prefer isolated studio PNG/WebP bottle images with transparent backgrounds.",
      options: { hotspot: true },
      fields: [
        { name: "alt", title: "Alt text", type: "string" },
        { name: "sourceUrl", title: "Source URL", type: "url" },
      ],
    },
    { name: "inStock", title: "In stock", type: "boolean", initialValue: true },
    { name: "stock", title: "Stock", type: "number", validation: (Rule: ValidationRule) => Rule.integer().min(0) },
    { name: "stockCount", title: "Stock count", type: "number", validation: (Rule: ValidationRule) => Rule.integer().min(0) },
    {
      name: "variants",
      title: "Variants",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", title: "Label", type: "string", validation: (Rule: ValidationRule) => Rule.required() },
            { name: "size", title: "Size", type: "string", validation: (Rule: ValidationRule) => Rule.required() },
            { name: "price", title: "Price (NGN)", type: "number", validation: (Rule: ValidationRule) => Rule.required().min(0) },
            { name: "stock", title: "Stock", type: "number", validation: (Rule: ValidationRule) => Rule.integer().min(0) },
            { name: "sku", title: "SKU", type: "string" },
          ],
          preview: {
            select: { title: "label", subtitle: "size" },
          },
        },
      ],
    },
    {
      name: "images",
      title: "Images",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [{ name: "alt", title: "Alt text", type: "string" }],
        },
      ],
    },
    {
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "wineCategory" }],
    },
    { name: "featured", title: "Featured", type: "boolean", initialValue: false },
    { name: "rating", title: "Rating", type: "number", validation: (Rule: ValidationRule) => Rule.min(0).max(5) },
    {
      name: "pairings",
      title: "Food pairings",
      type: "array",
      of: [{ type: "string" }],
    },
    {
      name: "accentColor",
      title: "Accent color",
      type: "string",
      description: "Hex color for dynamic product backgrounds, e.g. #C48B3E.",
      validation: (Rule: ValidationRule) => Rule.regex(/^#([0-9A-Fa-f]{3}){1,2}$/, { name: "hex color" }),
    },
    {
      name: "seo",
      title: "SEO overrides",
      type: "object",
      description: "Optional. Overrides the auto-generated meta tags for this product.",
      options: { collapsible: true, collapsed: true },
      fields: [
        { name: "metaTitle", title: "Meta title", type: "string" },
        { name: "metaDescription", title: "Meta description", type: "text", rows: 3 },
        { name: "ogImage", title: "Social share image", type: "image" },
      ],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "origin",
      media: "bottleImage",
    },
  },
};
