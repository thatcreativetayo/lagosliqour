import type { Metadata } from "next";
import PremiumLanding from "@/components/home/PremiumLanding";
import { getAllWines, getFeaturedWines } from "@/lib/sanity/queries";

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
    const featured = await getFeaturedWines();
    const products = featured.length ? featured : await getAllWines();
    
    return <PremiumLanding products={products} />;
  } catch (error) {
    console.error("Failed to fetch wines:", error);
    // Return component with empty products array - will use fallback products
    return <PremiumLanding products={[]} />;
  }
}
