import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MotionProvider from "@/components/providers/MotionProvider";
import SmoothScroll from "@/components/providers/SmoothScroll";
import { ClerkProvider } from "@clerk/nextjs";
import NewsletterModal from "@/components/home/NewsletterModal";
import { retcaro, sentient } from "./fonts";

export const metadata: Metadata = {
  title: "Lagos Liquor | Premium Wines & Spirits",
  description:
    "Premium Nigerian wine and spirits e-commerce. Curated bottles delivered across Lagos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`min-h-full ${retcaro.variable} ${sentient.variable}`}>
        <body className="min-h-full w-screen overflow-x-hidden flex flex-col bg-cream text-ink antialiased font-sans">
          <MotionProvider>
            <SmoothScroll />
            <Navbar />
            <div className="flex-1">{children}</div>
            <Footer />
            <NewsletterModal />
          </MotionProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
