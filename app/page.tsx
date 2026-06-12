import type { Metadata } from "next";
import PremiumLanding from "@/components/home/PremiumLanding";
import { getAllWines, getFeaturedWines } from "@/lib/sanity/queries";

export const metadata: Metadata = {
  title: "Lagos Liqour | Premium Wine & Spirits Delivery in Lagos",
  description:
    "Shop ultra-premium tequila, wines, and spirits in Lagos. Authentic bottles, fast delivery, Clerk customer accounts, and secure Credo checkout.",
  openGraph: {
    title: "Lagos Liqour | Premium Wine & Spirits Delivery in Lagos",
    description:
      "Curated premium spirits and wines for Lagos clients, with authentic sourcing and secure NGN checkout.",
  },
};

export default async function Home() {
  const featured = await getFeaturedWines();
  const products = featured.length ? featured : await getAllWines();

  return <PremiumLanding products={products} />;
}
