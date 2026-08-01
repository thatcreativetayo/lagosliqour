import type { MetadataRoute } from "next";
import { getSeoSettings } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSeoSettings();
  const siteUrl = getSiteUrl();

  // Staging switch: block every crawler when the owner toggles it on.
  if (settings?.robots?.discourageSearchEngines) {
    return {
      rules: { userAgent: "*", disallow: "/" },
      sitemap: `${siteUrl}/sitemap.xml`,
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/studio", "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
