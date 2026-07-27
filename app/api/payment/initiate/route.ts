import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site-url";
import { sanityWriteClient } from "@/lib/sanity/write-client";

export interface InitiatePaymentRequest {
  reference: string;
  orderId: string;
  amount: number;
  email: string;
  customerName: string;
}

const defaultCredoBaseUrl = "https://api.credocentral.com";

function parseName(name: string) {
  const [firstName, ...rest] = name.trim().split(/\s+/);
  return {
    firstName: firstName || name,
    lastName: rest.join(" "),
  };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

function validatePaymentRequest(body: InitiatePaymentRequest) {
  if (!body.reference || !body.orderId || !body.email || !body.customerName) {
    return "Missing required payment details";
  }

  if (!Number.isFinite(body.amount) || body.amount <= 0) {
    return "Invalid payment amount";
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as InitiatePaymentRequest;
    const validationError = validatePaymentRequest(body);

    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    const credoSecretKey = process.env.CREDO_SECRET_KEY;
    const credoPublicKey = process.env.CREDO_PUBLIC_KEY;
    const credoBaseUrl = process.env.CREDO_BASE_URL ?? defaultCredoBaseUrl;
    const baseUrl = getSiteUrl();

    if (!credoSecretKey || !credoPublicKey) {
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
    const { firstName, lastName } = parseName(body.customerName);

    const response = await fetch(`${credoBaseUrl}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: credoPublicKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInKobo,
        currency: "NGN",
        bearer: 0,
        channels: ["CARD", "BANK"],
        initializeAccount: 0,
        email: body.email,
        customerFirstName: firstName,
        customerLastName: lastName,
        reference: body.reference,
        callbackUrl: `${baseUrl}/payment/verify?reference=${body.reference}`,
        narration: `Lagos Liquor order ${body.reference}`,
        metadata: {
          orderId: body.orderId,
          customerName: body.customerName,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Credo API error:", errorText);
      const isAuthError = response.status === 401;
      return NextResponse.json(
        {
          error: isAuthError
            ? "Credo authorization failed"
            : "Payment initialization failed",
          details: isAuthError
            ? "Credo rejected the configured public key. Use demo keys with https://api.credodemo.com, or set CREDO_BASE_URL=https://api.credocentral.com for live keys."
            : errorText,
          statusCode: response.status,
        },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (![0, 200].includes(data.status) || !data.data?.authorizationUrl) {
      return NextResponse.json(
        { error: "Invalid payment response", details: data },
        { status: 500 }
      );
    }

    try {
      await sanityWriteClient
        .patch(body.orderId)
        .set({
          paymentStatus: "initiated",
          paymentAmountKobo: amountInKobo,
          ...(data.data.credoReference
            ? { credoReference: data.data.credoReference }
            : {}),
        })
        .commit();
    } catch (sanityError) {
      console.error("Failed to store Credo payment details on Sanity order:", sanityError);
    }

    return NextResponse.json({
      authorizationUrl: data.data.authorizationUrl,
      reference: data.data.reference,
      credoReference: data.data.credoReference,
    });
  } catch (error) {
    console.error("Payment initiation error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}
