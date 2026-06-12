import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from("newsletter_subscribers")
      .insert({ email })
      .select()
      .single();

    if (error) {
      // Check if email already exists
      if (error.code === "23505") {
        return NextResponse.json({ message: "Already subscribed" }, { status: 200 });
      }
      console.error("Newsletter error:", error);
      return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
    }

    return NextResponse.json({ message: "Subscribed successfully" });
  } catch (error) {
    console.error("Newsletter error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
