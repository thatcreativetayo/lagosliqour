import type { Metadata } from "next";
import "./globals.css";
import MotionProvider from "@/components/providers/MotionProvider";
import { ClerkProvider } from "@clerk/nextjs";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import StructuredData, { organizationData, websiteData, localBusinessData } from "@/components/seo/StructuredData";
import { getSeoSettings } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";
import { retcaro, sentient } from "./fonts";

const FALLBACK_TITLE = "Lagos Liquor | Premium Wines & Spirits Delivery in Lagos, Nigeria";
const FALLBACK_DESCRIPTION =
  "Lagos' premier online liquor store. Shop premium wines, whiskey, cognac, champagne, tequila & spirits. Fast delivery across Lagos & Nigeria. Temperature-controlled shipping. Order alcohol online Nigeria.";
const FALLBACK_KEYWORDS = [
  "lagos liquor",
  "lagos liquor store",
  "buy liquor lagos",
  "buy alcohol lagos",
  "wine shop lagos",
  "buy wine lagos",
  "whiskey lagos",
  "spirits lagos",
  "alcohol delivery lagos",
  "online liquor store lagos",
  "buy wine nigeria",
  "cognac lagos",
  "champagne lagos",
  "tequila lagos",
  "liquor store nigeria",
  "premium spirits lagos",
  "wine delivery lagos",
  "alcohol shop lagos",
  "buy drinks lagos",
  "liquor delivery nigeria",
];
const GOOGLE_SITE_VERIFICATION =
  "Og8MrCUWYNzXLqFq39GvxWthU90vUC-1LdJwDbeiwPQ";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSeoSettings();
  const seo = settings?.seo;
  const siteUrl = getSiteUrl();

  const defaultTitle = seo?.siteTitle || FALLBACK_TITLE;
  const template = seo?.titleTemplate || "%s | Lagos Liquor";
  const description = seo?.defaultDescription || FALLBACK_DESCRIPTION;
  const keywords = seo?.keywords?.length ? seo.keywords : FALLBACK_KEYWORDS;
  const ogImage = seo?.defaultOgImage?.url || "/og-image.jpg";
  const noindex = settings?.robots?.discourageSearchEngines === true;

  return {
    title: { default: defaultTitle, template },
    description,
    keywords,
    authors: [{ name: settings?.org?.name || "Lagos Liquor" }],
    creator: settings?.org?.name || "Lagos Liquor",
    publisher: settings?.org?.name || "Lagos Liquor",
    metadataBase: new URL(siteUrl),
    openGraph: {
      type: "website",
      locale: "en_NG",
      url: "/",
      siteName: seo?.siteTitle || "Lagos Liquor",
      title: defaultTitle,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: defaultTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description,
      images: [ogImage],
      creator: "@lagosliquor",
    },
    robots: noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    verification: {
      google: settings?.verification?.google || GOOGLE_SITE_VERIFICATION,
      ...(settings?.verification?.bing
        ? { other: { "msvalidate.01": settings.verification.bing } }
        : {}),
    },
  };
}

// Check if Clerk is configured
const isClerkConfigured = !!(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
  process.env.CLERK_SECRET_KEY
);

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSeoSettings();

  const content = (
    <html lang="en" className={`min-h-full ${retcaro.variable} ${sentient.variable}`}>
      <head>
        <StructuredData data={organizationData(settings)} />
        <StructuredData data={websiteData(settings)} />
        <StructuredData data={localBusinessData(settings)} />
      </head>
      <body className="min-h-full w-screen overflow-x-hidden flex flex-col bg-cream text-ink antialiased font-sans">
        <MotionProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
        </MotionProvider>
      </body>
    </html>
  );

  // Only use ClerkProvider if configured
  if (isClerkConfigured) {
    return <ClerkProvider>{content}</ClerkProvider>;
  }

  return content;
}
