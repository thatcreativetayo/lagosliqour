import { NextResponse } from "next/server";

export interface InitiatePaymentRequest {
  reference: string;
  orderId: string;
  amount: number;
  email: string;
  customerName: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as InitiatePaymentRequest;

    const credoSecretKey = process.env.CREDO_SECRET_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    if (!credoSecretKey) {
      return NextResponse.json(
        { error: "Payment gateway not configured" },
        { status: 500 }
      );
    }

    if (!baseUrl) {
      return NextResponse.json(
        { error: "Base URL not configured" },
        { status: 500 }
      );
    }

    // Convert amount to kobo (multiply by 100)
    const amountInKobo = Math.round(body.amount * 100);

    const response = await fetch("https://api.credodemo.com/transaction/direct/initiate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${credoSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInKobo,
        currency: "NGN",
        email: body.email,
        reference: body.reference,
        callbackUrl: `${baseUrl}/payment/verify`,
        metadata: {
          orderId: body.orderId,
          customerName: body.customerName,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Credo API error:", errorText);
      return NextResponse.json(
        { error: "Payment initialization failed" },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (!data.status || !data.data?.authorizationUrl) {
      return NextResponse.json(
        { error: "Invalid payment response" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      authorizationUrl: data.data.authorizationUrl,
      reference: data.data.reference,
    });
  } catch (error) {
    console.error("Payment initiation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
