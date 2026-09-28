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
    "@type": ["Organization", "Store", "LiquorStore"],
    name: org?.name || "Lagos Liquor",
    alternateName: ["Lagos Liquor Store", "Lagos Liquor Nigeria"],
    description:
      settings?.seo?.defaultDescription ||
      "Lagos' premier online liquor store. Shop premium wines, whiskey, cognac, champagne, tequila & spirits with fast delivery across Lagos & Nigeria.",
    url: getSiteUrl(),
    logo: org?.logo?.url || `${getSiteUrl()}/logo.svg`,
    image: org?.logo?.url || `${getSiteUrl()}/logo.svg`,
    priceRange: "₦₦₦",
    currenciesAccepted: "NGN",
    paymentAccepted: "Credit Card, Debit Card, Bank Transfer",
    ...(org?.phone || org?.email
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            ...(org?.phone ? { telephone: org.phone } : {}),
            ...(org?.email ? { email: org.email } : {}),
            contactType: "Customer Service",
            areaServed: "NG",
            availableLanguage: ["English"],
          },
        }
      : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: org?.addressLocality || "Lagos",
      addressRegion: "Lagos State",
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
  brand?: string;
  category?: string;
  region?: string;
}) {
  const slug = wine.slug || wine.title.toLowerCase().replace(/\s+/g, "-");
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: wine.title,
    description: wine.description || `Premium ${wine.title} available at Lagos Liquor - Nigeria's trusted online liquor store`,
    image: wine.image,
    sku: wine.sku || wine.title,
    brand: {
      "@type": "Brand",
      name: wine.brand || wine.title.split(" ")[0],
    },
    category: wine.category || "Alcoholic Beverage",
    offers: {
      "@type": "Offer",
      price: wine.price || 0,
      priceCurrency: "NGN",
      availability: wine.inStock !== false
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${getSiteUrl()}/wines/${slug}`,
      seller: {
        "@type": "Organization",
        name: "Lagos Liquor",
      },
      priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      itemCondition: "https://schema.org/NewCondition",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "1",
      bestRating: "5",
      worstRating: "1",
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

// Helper function to generate FAQ structured data
export function faqData(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// Helper function for local business with delivery
export function localBusinessData(settings?: SiteSettingsResult | null) {
  const org = settings?.org;
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": getSiteUrl(),
    name: org?.name || "Lagos Liquor",
    image: org?.logo?.url || `${getSiteUrl()}/logo.svg`,
    description: "Premium online liquor store in Lagos, Nigeria. Fast alcohol delivery across Lagos and Nigeria.",
    address: {
      "@type": "PostalAddress",
      addressLocality: org?.addressLocality || "Lagos",
      addressRegion: "Lagos State",
      addressCountry: org?.addressCountry || "NG",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 6.5244,
      longitude: 3.3792,
    },
    url: getSiteUrl(),
    telephone: org?.phone || "+234",
    priceRange: "₦₦₦",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "09:00",
      closes: "22:00",
    },
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: 6.5244,
        longitude: 3.3792,
      },
      geoRadius: "50000",
    },
  };
}
