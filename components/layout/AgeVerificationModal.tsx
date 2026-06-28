"use client";

import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";

const AGE_VERIFICATION_KEY = "lagos-liquor-age-verified";

export default function AgeVerificationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDenied, setShowDenied] = useState(false);

  useEffect(() => {
    // Check if user has already verified
    const verified = localStorage.getItem(AGE_VERIFICATION_KEY);
    if (!verified) {
      // Show modal after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleYes() {
    localStorage.setItem(AGE_VERIFICATION_KEY, "true");
    setIsOpen(false);
  }

  function handleNo() {
    setShowDenied(true);
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink/90 backdrop-blur-md"
          />

          <m.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative bg-cream border-2 border-wine max-w-lg w-full p-8 sm:p-12 text-center"
          >
            {!showDenied ? (
              <>
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-wine flex items-center justify-center">
                    <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-normal text-ink uppercase mb-3">
                    Age Verification
                  </h2>
                  <p className="text-body text-ink/70 px-4">
                    You must be 18 years or older to enter this site and purchase our products.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleYes}
                    className="bg-wine text-cream px-8 py-3 border-2 border-wine hover:bg-transparent hover:text-wine transition-all duration-300 uppercase text-sm tracking-wider font-sans"
                  >
                    I am 18 or older
                  </button>
                  <button
                    onClick={handleNo}
                    className="bg-transparent text-ink px-8 py-3 border-2 border-wine/30 hover:border-wine hover:text-wine transition-all duration-300 uppercase text-sm tracking-wider font-sans"
                  >
                    I am under 18
                  </button>
                </div>

                <p className="mt-6 text-xs text-ink/40">
                  By entering, you confirm that you are of legal drinking age in your country.
                </p>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-wine/10 border-2 border-wine flex items-center justify-center">
                    <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-normal text-wine uppercase mb-3">
                    Access Denied
                  </h2>
                  <p className="text-body text-ink/70 px-4">
                    We're sorry, but you must be 18 years or older to access this site and purchase alcohol.
                  </p>
                </div>

                <p className="text-xs text-ink/40 mt-6">
                  Please exit this page. Drink responsibly.
                </p>
              </>
            )}
          </m.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
