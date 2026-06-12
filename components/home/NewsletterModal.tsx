"use client";

import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";

const NEWSLETTER_MODAL_KEY = "lagos-liquor-newsletter-shown";

export default function NewsletterModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if modal has been shown before
    const hasShown = localStorage.getItem(NEWSLETTER_MODAL_KEY);
    if (!hasShown) {
      // Show modal after 3 seconds
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to subscribe");
        setLoading(false);
        return;
      }

      setMessage("Thank you for subscribing!");
      localStorage.setItem(NEWSLETTER_MODAL_KEY, "true");
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setIsOpen(false);
    localStorage.setItem(NEWSLETTER_MODAL_KEY, "true");
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
          />
          
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative bg-cream border-2 border-wine max-w-md w-full p-8 sm:p-10"
          >
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 text-ink hover:text-wine transition-colors"
              aria-label="Close modal"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <h2 className="text-3xl sm:text-4xl font-normal text-ink uppercase mb-3">
                Welcome
              </h2>
              <p className="text-body text-ink/60">
                Join our curated wine club. Get exclusive offers, new arrivals, and tasting notes
                delivered to your inbox.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full border-2 border-wine/20 bg-transparent px-4 py-3 text-dark focus:border-wine focus:outline-none"
                />
              </div>

              {error ? (
                <div className="bg-wine/10 border border-wine/20 p-3 text-center">
                  <p className="text-xs text-wine">{error}</p>
                </div>
              ) : null}

              {message ? (
                <div className="bg-gold/10 border border-gold/20 p-3 text-center">
                  <p className="text-xs text-dark font-medium">{message}</p>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-wine text-cream py-3 border-2 border-wine hover:bg-transparent hover:text-wine transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm tracking-wider"
              >
                {loading ? "Subscribing..." : "Subscribe"}
              </button>

              <p className="text-xs text-center text-ink/40">
                We respect your privacy. Unsubscribe anytime.
              </p>
            </form>
          </m.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
