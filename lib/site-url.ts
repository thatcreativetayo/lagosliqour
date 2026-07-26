const canonicalSiteUrl = "https://lagosliquor.com";

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? canonicalSiteUrl;
}
