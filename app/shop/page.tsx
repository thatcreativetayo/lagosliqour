import { getAllWines, getCategories } from "@/lib/sanity/queries";
import ShopClient from "./ShopClient";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("shop", {
    title: "Shop | Lagos Liquor",
    description:
      "Browse our full collection of premium wines and spirits. Shop fine wines, whiskey, cognac, champagne, and more with temperature-controlled delivery across Lagos.",
    path: "/shop",
  });
}

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
