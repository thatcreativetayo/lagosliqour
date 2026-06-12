"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

export default function Newsletter() {
  const [email, setEmail] = useState("");

  return (
    <section className="bg-ink py-20 sm:py-28 lg:py-32">
      <div className="max-w-[640px] mx-auto px-6 text-center">
        <p className="text-eyebrow text-gold mb-6">The Inner Circle</p>
        <h2 className="font-display text-heading-2 italic text-cream mb-6 leading-snug">
          &ldquo;The finest drops,
          <br />
          first.&rdquo;
        </h2>
        <p className="text-body text-cream/50 mb-10">
          Early access to limited releases. Private tastings. Members-only
          pricing.
        </p>

        <div className="flex flex-col sm:flex-row items-end gap-4 sm:gap-0 max-w-md mx-auto border-b border-gold/40 focus-within:border-gold transition-colors">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="flex-1 w-full bg-transparent border-0 outline-none font-ui text-[13px] text-cream placeholder:text-cream/30 py-3 sm:py-2"
            aria-label="Email address"
          />
          <Button
            variant="gold"
            className="shrink-0 !px-5 !py-2.5 sm:ml-4"
            onClick={() => setEmail("")}
          >
            Join the List
          </Button>
        </div>
      </div>
    </section>
  );
}
