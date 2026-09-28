import type { Metadata } from "next";
import Hero from "@/components/home/Hero";
import PremiumLanding from "@/components/home/PremiumLanding";
import { getAllWines, getFeaturedWines, getCategories } from "@/lib/sanity/queries";
import { buildPageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("home", {
    title: "Lagos Liquor Store | Buy Wine, Whiskey & Spirits Online in Lagos Nigeria",
    description:
      "Lagos' #1 online liquor store. Buy premium wine, whiskey, cognac, champagne, tequila & spirits. Fast delivery across Lagos & Nigeria. Order alcohol online with secure checkout. Temperature-controlled shipping.",
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
