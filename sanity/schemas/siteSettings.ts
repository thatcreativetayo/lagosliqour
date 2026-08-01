import { defineField, defineType } from "sanity";

export const siteSettingsSchema = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "homepage", title: "Homepage", default: true },
    { name: "seo", title: "SEO Defaults" },
    { name: "organization", title: "Organization" },
    { name: "pages", title: "Page SEO" },
    { name: "advanced", title: "Verification & Robots" },
  ],
  fields: [
    // --- Homepage ---
    defineField({
      name: "heroHeadline",
      title: "Hero headline",
      type: "string",
      group: "homepage",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroSubtext",
      title: "Hero subtext",
      type: "text",
      group: "homepage",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      group: "homepage",
      options: { hotspot: true },
      fields: [{ name: "alt", title: "Alt text", type: "string" }],
    }),
    defineField({
      name: "featuredWines",
      title: "Featured wines",
      type: "array",
      group: "homepage",
      of: [{ type: "reference", to: [{ type: "wine" }] }],
    }),
    // --- SEO Defaults ---
    defineField({
      name: "seo",
      title: "SEO Defaults",
      type: "object",
      group: "seo",
      options: { collapsible: true, collapsed: false },
      fields: [
        {
          name: "siteTitle",
          title: "Site title",
          type: "string",
          description: "Default page title, e.g. 'Lagos Liquor | Premium Wines & Spirits'.",
        },
        {
          name: "titleTemplate",
          title: "Title template",
          type: "string",
          description: "Use %s for the page name, e.g. '%s | Lagos Liquor'.",
        },
        {
          name: "defaultDescription",
          title: "Default meta description",
          type: "text",
          rows: 3,
        },
        {
          name: "keywords",
          title: "Keywords",
          type: "array",
          of: [{ type: "string" }],
          options: { layout: "tags" },
        },
        {
          name: "defaultOgImage",
          title: "Default social share image",
          type: "image",
          description: "Recommended 1200x630. Used for Open Graph / Twitter cards.",
        },
      ],
    }),
    // --- Organization / structured data ---
    defineField({
      name: "org",
      title: "Organization (structured data)",
      type: "object",
      group: "organization",
      options: { collapsible: true, collapsed: false },
      fields: [
        { name: "name", title: "Organization name", type: "string" },
        {
          name: "logo",
          title: "Logo",
          type: "image",
          description: "Used in search-engine structured data.",
        },
        { name: "phone", title: "Contact phone", type: "string" },
        { name: "email", title: "Contact email", type: "string" },
        {
          name: "addressLocality",
          title: "City / locality",
          type: "string",
          initialValue: "Lagos",
        },
        {
          name: "addressCountry",
          title: "Country code",
          type: "string",
          initialValue: "NG",
        },
        {
          name: "social",
          title: "Social links",
          type: "object",
          fields: [
            { name: "instagram", title: "Instagram URL", type: "url" },
            { name: "facebook", title: "Facebook URL", type: "url" },
            { name: "x", title: "X / Twitter URL", type: "url" },
            { name: "tiktok", title: "TikTok URL", type: "url" },
          ],
        },
      ],
    }),
    // --- Per-page SEO overrides ---
    defineField({
      name: "pages",
      title: "Page SEO overrides",
      type: "array",
      group: "pages",
      description: "Override title / description / share image for specific pages.",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "pageKey",
              title: "Page",
              type: "string",
              validation: (Rule) => Rule.required(),
              options: {
                list: [
                  { title: "Home", value: "home" },
                  { title: "Shop", value: "shop" },
                  { title: "About", value: "about" },
                  { title: "Contact", value: "contact" },
                ],
                layout: "dropdown",
              },
            },
            { name: "title", title: "Title", type: "string" },
            { name: "description", title: "Meta description", type: "text", rows: 3 },
            { name: "ogImage", title: "Share image", type: "image" },
          ],
          preview: {
            select: { title: "pageKey", subtitle: "title" },
          },
        },
      ],
    }),
    // --- Verification & robots ---
    defineField({
      name: "verification",
      title: "Search engine verification",
      type: "object",
      group: "advanced",
      options: { collapsible: true, collapsed: false },
      fields: [
        { name: "google", title: "Google verification code", type: "string" },
        { name: "bing", title: "Bing verification code", type: "string" },
      ],
    }),
    defineField({
      name: "robots",
      title: "Search engine indexing",
      type: "object",
      group: "advanced",
      fields: [
        {
          name: "discourageSearchEngines",
          title: "Discourage search engines from indexing this site",
          type: "boolean",
          initialValue: false,
          description:
            "When on, robots.txt blocks all crawlers and pages are marked noindex. Use only for staging.",
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Site Settings" };
    },
  },
});
