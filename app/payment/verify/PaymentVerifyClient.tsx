"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/lib/stores/cart";

type PaymentStatus = "verifying" | "success" | "failed";

export default function PaymentVerifyClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const cart = useCartStore();
  const [status, setStatus] = useState<PaymentStatus>("verifying");
  const [reference, setReference] = useState<string>("");
  const [failureMessage, setFailureMessage] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function verifyPayment(attempt = 0) {
      const ref =
        searchParams.get("reference") ??
        searchParams.get("businessRef") ??
        searchParams.get("business_ref");
      const transRef =
        searchParams.get("transRef") ??
        searchParams.get("transref") ??
        searchParams.get("credoReference") ??
        searchParams.get("credo_reference");

      if (!ref && !transRef) {
        setFailureMessage("Missing payment reference from the gateway.");
        setStatus("failed");
        return;
      }

      setReference(ref ?? transRef ?? "");
      setStatus("verifying");

      try {
        const params = new URLSearchParams(searchParams.toString());
        if (ref && !params.has("reference")) params.set("reference", ref);
        if (transRef && !params.has("transRef")) params.set("transRef", transRef);

        const response = await fetch(`/api/payment/verify?${params.toString()}`);
        const data = await response.json().catch(() => null);

        if (cancelled) return;

        if (!response.ok) {
          console.error("Payment verification failed:", data);
          setFailureMessage(data?.error ?? "Payment verification failed.");
          setStatus("failed");
          return;
        }

        if (data.status === "success") {
          setStatus("success");
          setReference(data.reference);
          cart.clearCart();
          router.replace(`/thank-you?ref=${encodeURIComponent(data.reference)}&paid=1`);
          return;
        }

        if (data.status === "pending" && attempt < 4) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          if (!cancelled) {
            await verifyPayment(attempt + 1);
          }
          return;
        }

        if (data.status === "pending") {
          setFailureMessage(
            data.message ??
              "Payment is still processing. Please wait a moment and refresh this page."
          );
          setStatus("failed");
          return;
        }

        console.error("Payment verification rejected:", data);
        setFailureMessage(data.message ?? "Payment was not successful.");
        setStatus("failed");
      } catch (error) {
        if (cancelled) return;
        console.error("Verification error:", error);
        setStatus("failed");
      }
    }

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [searchParams, router, cart]);

  if (status === "verifying") {
    return (
      <main className="bg-cream pt-28 sm:pt-32 pb-20">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 border-4 border-wine border-t-transparent rounded-full animate-spin mx-auto mb-8" />
            <h1 className="text-5xl font-normal text-ink uppercase mb-6">
              Verifying Payment
            </h1>
            <p className="text-body text-ink/60">
              Please wait while we confirm your payment...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (status === "success") {
    return (
      <main className="bg-cream pt-28 sm:pt-32 pb-20">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-wine/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg
                className="w-10 h-10 text-wine"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-5xl font-normal text-ink uppercase mb-6">
              Order Confirmed
            </h1>
            <p className="text-body text-ink/60 mb-8">
              Thank you for your order. Your payment has been received successfully.
            </p>
            {reference ? (
              <div className="bg-wine/5 p-6 mb-8">
                <p className="text-xs uppercase text-wine/70 mb-2">Order Reference</p>
                <p className="text-xl font-medium text-wine">{reference}</p>
              </div>
            ) : null}
            <p className="text-body text-ink/60 mb-8">
              We&apos;ll send you an email confirmation shortly with your order details and
              delivery information.
            </p>
            <Button href="/shop" variant="filled">
              Continue Shopping
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-cream pt-28 sm:pt-32 pb-20">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-wine/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg
              className="w-10 h-10 text-wine"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-5xl font-normal text-ink uppercase mb-6">
            Payment Failed
          </h1>
          <p className="text-body text-ink/60 mb-8">
            {failureMessage || "We couldn't verify your payment. Your order has not been processed."}
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              variant="ghost"
              onClick={() => router.push("/checkout")}
            >
              Try Again
            </Button>
            <Button href="/shop" variant="filled">
              Back to Shop
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
