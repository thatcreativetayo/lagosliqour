import type { Metadata } from "next";
import { Suspense } from "react";
import PaymentVerifyClient from "./PaymentVerifyClient";

export const metadata: Metadata = {
  title: "Payment Verification | Lagos Liquor",
  description: "Verifying your payment...",
};

function LoadingFallback() {
  return (
    <main className="bg-cream pt-28 sm:pt-32 pb-20">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 border-4 border-wine border-t-transparent rounded-full animate-spin mx-auto mb-8" />
          <h1 className="text-5xl font-normal text-ink uppercase mb-6">
            Loading
          </h1>
        </div>
      </div>
    </main>
  );
}

export default function PaymentVerifyPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentVerifyClient />
    </Suspense>
  );
}
