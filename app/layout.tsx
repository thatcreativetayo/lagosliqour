import type { Metadata } from "next";
import "./globals.css";
import MotionProvider from "@/components/providers/MotionProvider";
import { ClerkProvider } from "@clerk/nextjs";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import StructuredData, { organizationData, websiteData } from "@/components/seo/StructuredData";
import { retcaro, sentient } from "./fonts";

export const metadata: Metadata = {
  title: {
    default: "Lagos Liquor | Premium Wines & Spirits",
    template: "%s | Lagos Liquor",
  },
  description:
    "Shop premium wines and spirits in Lagos. Curated collection of fine wines, whiskey, cognac, and more. Temperature-controlled delivery across Nigeria.",
  keywords: [
    "wine Lagos",
    "buy wine Nigeria",
    "premium spirits",
    "whiskey Lagos",
    "cognac Nigeria",
    "champagne delivery",
    "online liquor store",
    "fine wine shop",
    "alcohol delivery Lagos",
  ],
  authors: [{ name: "Lagos Liquor" }],
  creator: "Lagos Liquor",
  publisher: "Lagos Liquor",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://lagosliquor.com"),
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "/",
    siteName: "Lagos Liquor",
    title: "Lagos Liquor | Premium Wines & Spirits",
    description:
      "Shop premium wines and spirits in Lagos. Curated collection of fine wines, whiskey, cognac, and more. Temperature-controlled delivery across Nigeria.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Lagos Liquor - Premium Wines & Spirits",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lagos Liquor | Premium Wines & Spirits",
    description:
      "Shop premium wines and spirits in Lagos. Curated collection delivered across Nigeria.",
    images: ["/og-image.jpg"],
    creator: "@lagosliquor",
  },
  robots: {
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
    // Add your verification codes here
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

// Check if Clerk is configured
const isClerkConfigured = !!(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
  process.env.CLERK_SECRET_KEY
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <html lang="en" className={`min-h-full ${retcaro.variable} ${sentient.variable}`}>
      <head>
        <StructuredData data={organizationData()} />
        <StructuredData data={websiteData()} />
      </head>
      <body className="min-h-full w-screen overflow-x-hidden flex flex-col bg-cream text-ink antialiased font-sans">
        <MotionProvider>
          <ConditionalLayout><div className="bg-white h-screen w-screen"></div></ConditionalLayout>
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
