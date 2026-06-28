import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import PremiumLanding from "@/components/home/PremiumLanding";
import { getAllWines, getFeaturedWines, getCategories } from "@/lib/sanity/queries";

export const metadata: Metadata = {
  title: "Lagos Liqour | Premium Wine & Spirits Delivery in Lagos",
  description:
    "Shop ultra-premium tequila, wines, and spirits in Lagos. Authentic bottles, fast delivery, Clerk customer accounts, and secure checkout.",
  keywords: [
    "wine Lagos",
    "buy wine Nigeria",
    "premium spirits",
    "tequila Lagos",
    "whiskey Nigeria",
    "cognac delivery",
    "champagne",
    "online liquor store",
    "alcohol delivery",
    "fine wine shop",
  ],
  openGraph: {
    title: "Lagos Liqour | Premium Wine & Spirits Delivery in Lagos",
    description:
      "Curated premium spirits and wines for Lagos clients, with authentic sourcing and secure NGN checkout.",
    url: "/",
  },
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  try {
    const [featured, categories] = await Promise.all([
      getFeaturedWines(),
      getCategories(),
    ]);
    const products = featured.length ? featured : await getAllWines();

    return <PremiumLanding products={products} categories={categories} />;
  } catch (error) {
    console.error("Failed to fetch wines:", error);
    return <PremiumLanding products={[]} categories={[]} />;
  }
}
