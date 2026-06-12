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

  useEffect(() => {
    async function verifyPayment() {
      const ref = searchParams.get("reference");

      if (!ref) {
        setStatus("failed");
        return;
      }

      setReference(ref);

      try {
        const response = await fetch(`/api/payment/verify?reference=${ref}`);

        if (!response.ok) {
          setStatus("failed");
          return;
        }

        const data = await response.json();

        if (data.status === "success") {
          setStatus("success");
          // Clear cart after successful payment
          cart.clearCart();
        } else {
          setStatus("failed");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("failed");
      }
    }

    verifyPayment();
  }, [searchParams, cart]);

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
              We'll send you an email confirmation shortly with your order details and
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
            We couldn't verify your payment. Your order has not been processed.
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
