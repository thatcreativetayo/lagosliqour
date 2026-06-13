import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    // Validate environment variables at runtime
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase configuration");
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const { data: existing } = await supabaseServer
      .from("newsletter_subscribers")
      .select("email")
      .eq("email", email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "This email is already subscribed" },
        { status: 400 }
      );
    }

    // Insert new subscriber
    const { error } = await supabaseServer
      .from("newsletter_subscribers")
      .insert({
        email: email.toLowerCase(),
        is_active: true,
      });

    if (error) {
      console.error("Newsletter subscription error:", error);
      return NextResponse.json(
        { error: "Failed to subscribe" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to newsletter",
    });
  } catch (error) {
    console.error("Newsletter API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
