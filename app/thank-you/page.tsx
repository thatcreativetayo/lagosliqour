import type { Metadata } from "next";
import { Suspense } from "react";
import ThankYouClient from "./ThankYouClient";

export const metadata: Metadata = {
  title: "Thank You | Lagos Liquor",
  description: "Your order has been received.",
};

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="bg-cream min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-ink/60">Loading...</p>
        </div>
      </div>
    }>
      <ThankYouClient />
    </Suspense>
  );
}
