import { NextResponse } from "next/server";
import { getLikedWines } from "@/lib/sanity/queries";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams
      .get("ids")
      ?.split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (!ids?.length) {
      return NextResponse.json({ wines: [] });
    }

    const wines = await getLikedWines(ids);
    return NextResponse.json({ wines });
  } catch (error) {
    console.error("Liked wines fetch error:", error);
    return NextResponse.json(
      { error: "Failed to load liked wines" },
      { status: 500 }
    );
  }
}
