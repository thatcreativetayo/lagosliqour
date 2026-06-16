import { getAllWines, getCategories } from "@/lib/sanity/queries";
import ShopClient from "./ShopClient";

export const metadata = {
  title: "Shop | Lagos Liquor",
  description: "Browse our full collection of premium wines and spirits.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  try {
    const { category } = await searchParams;
    const wines = await getAllWines();
    const categories = await getCategories();

    return (
      <ShopClient 
        wines={wines} 
        categories={categories} 
        initialCategory={typeof category === "string" ? category : undefined}
      />
    );
  } catch (error) {
    console.error("Failed to fetch wines:", error);
    return <ShopClient wines={[]} categories={[]} />;
  }
}
