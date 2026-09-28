import { getAllWines, getCategories } from "@/lib/sanity/queries";
import ShopClient from "./ShopClient";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("shop", {
    title: "Shop Liquor Online Lagos | Wine, Whiskey, Spirits Delivery Nigeria",
    description:
      "Browse Lagos' largest online liquor collection. Buy premium wines, whiskey, cognac, champagne, tequila & spirits. Fast alcohol delivery across Lagos & Nigeria. Shop liquor online with secure payment.",
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
