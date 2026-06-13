import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    // Validate environment variables at runtime
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase configuration");
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const { data: orders, error } = await supabaseServer
      .from("orders")
      .select("*")
      .eq("customer_email", email)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch orders:", error);
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }

    return NextResponse.json({ orders: orders || [] });
  } catch (error) {
    console.error("Orders API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
