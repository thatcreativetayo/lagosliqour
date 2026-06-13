import { getAllWines, getCategories } from "@/lib/sanity/queries";
import ShopClient from "./ShopClient";

export const metadata = {
  title: "Shop | Lagos Liquor",
  description: "Browse our full collection of premium wines and spirits.",
};

export default async function ShopPage() {
  try {
    const wines = await getAllWines();
    const categories = await getCategories();

    return <ShopClient wines={wines} categories={categories} />;
  } catch (error) {
    console.error("Failed to fetch wines:", error);
    return <ShopClient wines={[]} categories={[]} />;
  }
}
