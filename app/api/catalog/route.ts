import { NextResponse } from "next/server";
import { getAllWinesForSearch, getCategories } from "@/lib/sanity/queries";

export async function GET() {
  try {
    const [categories, wines] = await Promise.all([
      getCategories(),
      getAllWinesForSearch(),
    ]);

    return NextResponse.json({ categories, wines });
  } catch (error) {
    console.error("Catalog fetch error:", error);
    return NextResponse.json(
      { error: "Failed to load catalog data" },
      { status: 500 }
    );
  }
}
