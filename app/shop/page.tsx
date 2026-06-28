import { getAllWines, getCategories } from "@/lib/sanity/queries";
import ShopClient from "./ShopClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop | Lagos Liquor",
  description:
    "Browse our full collection of premium wines and spirits. Shop fine wines, whiskey, cognac, champagne, and more with temperature-controlled delivery across Lagos.",
  openGraph: {
    title: "Shop Premium Wines & Spirits | Lagos Liquor",
    description:
      "Browse our curated collection of premium wines and spirits. Fine wines, whiskey, cognac, champagne, and more delivered across Nigeria.",
    url: "/shop",
  },
  alternates: {
    canonical: "/shop",
  },
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  try {
    const { category, q } = await searchParams;
    const wines = await getAllWines();
    const categories = await getCategories();

    return (
      <ShopClient
        wines={wines}
        categories={categories}
        initialCategory={typeof category === "string" ? category : undefined}
        initialQuery={typeof q === "string" ? q : undefined}
      />
    );
  } catch (error) {
    console.error("Failed to fetch wines:", error);
    return <ShopClient wines={[]} categories={[]} />;
  }
}
