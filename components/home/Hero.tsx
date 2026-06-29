"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { m, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown04FreeIcons,
  ArrowDownNarrowWideFreeIcons,
} from "@hugeicons/core-free-icons";

const messages = [
  { prefix: "100", symbol: "%", text: " Authentic Imported Bottles." },
  { text: "Free Same-Day Delivery in some part of Lagos." },
];

const ease = [0.25, 0.1, 0.25, 1] as const;

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 3500); // Change message every 3.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-screen flex flex-col justify-center items-center overflow-hidden">
      {/* Mobile Hero Image */}
      <m.img
        initial={{ opacity: 0, rotate: -35 }}
        animate={{ opacity: 1, rotate: -35 }}
        transition={{ duration: 1.2, delay: 0.6, ease }}
        src="/heromobile.png"
        alt="Hero Image"
        width={600}
        height={600}
        className="md:hidden -rotate-35 -bottom-16 w-[70%] absolute"
      />

      {/* Desktop Hero Image */}
      <m.img
        initial={{ opacity: 0, rotate: -35 }}
        animate={{ opacity: 1, rotate: -35 }}
        transition={{ duration: 1.2, delay: 0.6, ease }}
        src="/hero3.png"
        alt="Hero Image"
        width={1000}
        height={1000}
        className="hidden md:block -rotate-35 -bottom-16 w-[80%] absolute"
      />

      <div className="w-full justify-between flex flex-col h-full pt-16 mx-auto px-6 sm:px-10 lg:px-16 pb-12">
        {/* Animated Rotating Text */}
        <div className="h-[100px] sm:h-[120px] md:h-[140px] lg:h-[160px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <m.h1
              key={currentIndex}
              initial={{ opacity: 0, y: -60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-wine text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-center leading-tight"
            >
              {"prefix" in messages[currentIndex] ? (
                <>
                  <span className="font-head">{messages[currentIndex].prefix}</span>
                  <span className="font-sans">{messages[currentIndex].symbol}</span>
                  <span className="font-head">{messages[currentIndex].text}</span>
                </>
              ) : (
                <span className="font-head">{messages[currentIndex].text}</span>
              )}
            </m.h1>
          </AnimatePresence>
        </div>

        <div className="flex flex-col z-40 w-full">
          <div className="w-full justify-end flex items-end">
            <div className="w-fit flex items-start pb-20 md:pb-40 flex-col gap-3">
              <p className="text-dark text-sm sm:text-base max-w-md">
                Discover a curated collection of premium wines, whiskeys, and craft liqours delivered straight to your door.
              </p>
              <button className="font-serif w-fit text-cream hover:bg-transparent border-2 border-wine hover:text-wine transition-all duration-300 cursor-pointer bg-wine py-2 px-4 text-base md:text-lg uppercase">
                Explore collection
              </button>
            </div>
          </div>
          <div className="hidden md:flex gap-12 items-center">
            <div className="flex h-fit items-center gap-6">
              <div className="flex flex-col h-fit text-left gap-3">
                <h1 className="text-5xl text-wine">500+</h1>
                <p className="text-wine">Premium Brands</p>
              </div>
              <div className="h-16 bg-linear-to-b from-transparent via-wine to-transparent w-px"></div>
            </div>
            <div className="flex h-fit items-center gap-6">
              <div className="flex flex-col h-fit text-left gap-3">
                <h1 className="text-5xl text-wine">50K+</h1>
                <p className="text-wine">Happy Customers</p>
              </div>
              <div className="h-16 bg-linear-to-b from-transparent via-wine to-transparent w-px"></div>
            </div>
            <div className="flex h-fit items-center gap-6">
              <div className="flex flex-col h-fit text-left gap-3">
                <h1 className="text-5xl text-wine">24/7</h1>
                <p className="text-wine">Fast Delivery</p>
              </div>
              <div className="h-16 bg-linear-to-b from-transparent via-wine to-transparent w-px"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
