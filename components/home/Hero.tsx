"use client";
import Image from "next/image"
import { m } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown04FreeIcons,
  ArrowDownNarrowWideFreeIcons,
} from "@hugeicons/core-free-icons";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const ease = [0.25, 0.1, 0.25, 1] as const;

export default function Hero() {
  return (
    <section
      className="relative h-screen flex flex-col justify-center items-center"
    >
      {/* Desktop Hero Image */}
      <m.img
        {...fadeUp}
        transition={{ duration: 0.9, delay: 0.4, ease }}
        src="/hero2.png" 
        alt="Hero Image" 
        width={1000} 
        height={1000} 
        className="hidden md:block -rotate-35 -bottom-16 w-[80%] absolute" 
      />
      
      {/* Mobile Hero Image */}
   

      <div className="w-full justify-between flex flex-col h-full pt-16 mx-auto px-6 sm:px-10 lg:px-16 pb-12">
        <m.h1
          {...fadeUp}
          transition={{ duration: 0.9, delay: 0.4, ease }}
          className="font-normal text-wine text-4xl sm:text-6xl md:text-7xl lg:text-[96px] text-center"
        >
          Raise Your Spirits with Every Sip.
        </m.h1>

        <div className="flex flex-col z-40 w-full">
          <div className="w-full justify-end flex items-end">
             <div className="w-fit flex items-start pb-20 md:pb-40 flex-col gap-3">
            <p className="text-dark text-sm sm:text-base max-w-md">Discover a curated collection of premium wines, whiskeys, and craft liqours delivered straight to your door.</p>
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
