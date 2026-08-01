import { cache } from "react";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/sanity/queries";
import { getSiteUrl } from "@/lib/site-url";
import type { PageSeoOverride, SiteSettingsResult } from "@/lib/sanity/types";

export type PageKey = PageSeoOverride["pageKey"];

/**
 * Cached per-request so layout + page metadata builds share a single fetch.
 * Never throws — SEO must not break the site if Sanity is unreachable.
 */
export const getSeoSettings = cache(async (): Promise<SiteSettingsResult | null> => {
  try {
    return await getSiteSettings();
  } catch (error) {
    console.error("Failed to load SEO settings:", error);
    return null;
  }
});

export interface PageMetaFallback {
  title: string;
  description: string;
  /** Path relative to the site root, e.g. "/shop". */
  path: string;
}

/**
 * Build Next.js Metadata for a page: Sanity per-page override → global
 * default → hardcoded fallback. Keeps the site valid when Sanity is empty.
 */
export async function buildPageMetadata(
  pageKey: PageKey,
  fallback: PageMetaFallback
): Promise<Metadata> {
  const settings = await getSeoSettings();
  const seo = settings?.seo;
  const override = settings?.pages?.find((p) => p.pageKey === pageKey);

  const title = override?.title || fallback.title;
  const description =
    override?.description || seo?.defaultDescription || fallback.description;

  const ogImage = override?.ogImage?.url || seo?.defaultOgImage?.url;
  const url = `${getSiteUrl()}${fallback.path}`;

  const noindex = settings?.robots?.discourageSearchEngines === true;

  return {
    title,
    description,
    alternates: { canonical: fallback.path },
    openGraph: {
      title,
      description,
      url,
      siteName: seo?.siteTitle || "Lagos Liquor",
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}
