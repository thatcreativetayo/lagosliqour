import type { Metadata } from "next";
import "./globals.css";
import MotionProvider from "@/components/providers/MotionProvider";
import { ClerkProvider } from "@clerk/nextjs";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import { retcaro, sentient } from "./fonts";

export const metadata: Metadata = {
  title: "Lagos Liquor | Premium Wines & Spirits",
  description:
    "Premium Nigerian wine and spirits e-commerce. Curated bottles delivered across Lagos.",
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
