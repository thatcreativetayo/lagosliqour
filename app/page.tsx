import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import PremiumLanding from "@/components/home/PremiumLanding";
import { getAllWines, getFeaturedWines, getCategories } from "@/lib/sanity/queries";
import { buildPageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("home", {
    title: "Lagos Liqour | Premium Wine & Spirits Delivery in Lagos",
    description:
      "Shop ultra-premium tequila, wines, and spirits in Lagos. Authentic bottles, fast delivery, Clerk customer accounts, and secure checkout.",
    path: "/",
  });
}

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
