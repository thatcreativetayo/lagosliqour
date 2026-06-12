"use client";

import Button from "@/components/ui/Button";

export default function WineError() {
  return (
    <main className="bg-cream pt-28 sm:pt-32 pb-20">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 text-center">
        <h1 className="text-5xl font-normal text-ink uppercase">Could not load wine</h1>
        <p className="text-body text-ink/60 mt-4 mb-8 max-w-lg mx-auto">
          The cellar is taking a moment to respond. Please try the collection again.
        </p>
        <Button href="/shop">Return to Shop</Button>
      </div>
    </main>
  );
}
