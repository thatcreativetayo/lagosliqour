"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  return (
    <main className="bg-cream pt-28 sm:pt-32 pb-20">
      <div className="max-w-[640px] mx-auto px-6 sm:px-10">
        <p className="text-eyebrow text-wine mb-6">Contact</p>
        <h1 className="text-heading-1 font-display font-normal text-ink mb-4">
          We&apos;re here.
        </h1>
        <p className="text-body text-ink/60 mb-12">
          Questions about delivery, gifting, or membership? Reach our team —
          we respond within hours.
        </p>

        <div className="flex flex-col gap-8">
          <div>
            <label className="text-label text-ink/50 block mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border-b border-[var(--border)] py-3 font-ui text-[14px] text-ink outline-none focus:border-wine transition-colors"
            />
          </div>
          <div>
            <label className="text-label text-ink/50 block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-[var(--border)] py-3 font-ui text-[14px] text-ink outline-none focus:border-wine transition-colors"
            />
          </div>
          <div>
            <label className="text-label text-ink/50 block mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full bg-transparent border-b border-[var(--border)] py-3 font-ui text-[14px] text-ink outline-none focus:border-wine transition-colors resize-none"
            />
          </div>
          <Button
            onClick={() => {
              setName("");
              setEmail("");
              setMessage("");
            }}
          >
            Send Message
          </Button>
        </div>

        <div className="mt-16 pt-12 border-t border-[var(--border)]">
          <p className="text-label text-ink/50 mb-2">Delivery Areas</p>
          <p className="text-body text-ink/70">
            Lagos Island · Victoria Island · Ikoyi · Lekki · Mainland
          </p>
        </div>
      </div>
    </main>
  );
}
