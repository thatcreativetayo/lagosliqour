import { getSiteUrl } from "@/lib/site-url";
import type { SiteSettingsResult } from "@/lib/sanity/types";

interface StructuredDataProps {
  data: Record<string, unknown>;
}

export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Helper function to generate organization structured data
export function organizationData(settings?: SiteSettingsResult | null) {
  const org = settings?.org;
  const social = org?.social;
  const sameAs = [social?.instagram, social?.facebook, social?.x, social?.tiktok].filter(
    (v): v is string => Boolean(v)
  );

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: org?.name || "Lagos Liquor",
    description:
      settings?.seo?.defaultDescription ||
      "Premium Nigerian wine and spirits e-commerce. Curated bottles delivered across Lagos.",
    url: getSiteUrl(),
    logo: org?.logo?.url || `${getSiteUrl()}/logo.svg`,
    ...(org?.phone || org?.email
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            ...(org?.phone ? { telephone: org.phone } : {}),
            ...(org?.email ? { email: org.email } : {}),
            contactType: "Customer Service",
            availableLanguage: "English",
          },
        }
      : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: org?.addressLocality || "Lagos",
      addressCountry: org?.addressCountry || "NG",
    },
    ...(sameAs.length
      ? { sameAs }
      : {
          sameAs: [
            "https://instagram.com/lagosliquor",
            "https://facebook.com/lagosliquor",
            "https://twitter.com/lagosliquor",
          ],
        }),
  };
}

// Helper function to generate product structured data
export function productData(wine: {
  title: string;
  slug?: string;
  description?: string;
  price?: number;
  image: string;
  sku?: string;
  inStock?: boolean;
}) {
  const slug = wine.slug || wine.title.toLowerCase().replace(/\s+/g, "-");
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: wine.title,
    description: wine.description || wine.title,
    image: wine.image,
    sku: wine.sku || wine.title,
    offers: {
      "@type": "Offer",
      price: wine.price || 0,
      priceCurrency: "NGN",
      availability: wine.inStock !== false
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${getSiteUrl()}/wines/${slug}`,
    },
  };
}

// Helper function to generate breadcrumb structured data
export function breadcrumbData(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Helper function to generate website structured data
export function websiteData(settings?: SiteSettingsResult | null) {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings?.seo?.siteTitle || settings?.org?.name || "Lagos Liquor",
    url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${url}/shop?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
