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
export function organizationData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Lagos Liquor",
    description: "Premium Nigerian wine and spirits e-commerce. Curated bottles delivered across Lagos.",
    url: "https://lagosliquor.com",
    logo: "https://lagosliquor.com/logo.svg",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+234-XXX-XXX-XXXX",
      contactType: "Customer Service",
      availableLanguage: "English",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lagos",
      addressCountry: "NG",
    },
    sameAs: [
      "https://instagram.com/lagosliquor",
      "https://facebook.com/lagosliquor",
      "https://twitter.com/lagosliquor",
    ],
  };
}

// Helper function to generate product structured data
export function productData(wine: {
  title: string;
  description?: string;
  price?: number;
  image: string;
  sku?: string;
  inStock?: boolean;
}) {
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
      url: `https://lagosliquor.com/wines/${wine.title
        .toLowerCase()
        .replace(/\s+/g, "-")}`,
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
export function websiteData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Lagos Liquor",
    url: "https://lagosliquor.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://lagosliquor.com/shop?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };
}
