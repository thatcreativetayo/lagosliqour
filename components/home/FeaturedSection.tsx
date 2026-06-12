"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Button from "@/components/ui/Button";

export default function FeaturedSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      if (textRef.current) {
        gsap.fromTo(
          textRef.current,
          { opacity: 0, x: -40 },
          {
            opacity: 1,
            x: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 70%",
              once: true,
            },
          },
        );
      }
      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { opacity: 0, x: 40 },
          {
            opacity: 1,
            x: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 70%",
              once: true,
            },
          },
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-cream py-20 sm:py-28 lg:py-32">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        <div ref={textRef} className="lg:col-span-5">
          <p className="text-eyebrow text-wine mb-6">Our Collection</p>
          <h2 className="text-heading-1 font-display font-normal text-ink mb-6">
            A wine for every
            <br />
            Lagos evening.
          </h2>
          <p className="text-body text-ink/70 mb-8 max-w-md">
            The finest bottles from Bordeaux, Burgundy, Barossa, and Champagne
            — curated for the discerning Lagos palate. Every bottle is
            temperature-controlled and delivered same-day.
          </p>
          <Button href="/shop" variant="filled">
            Shop the Collection →
          </Button>
        </div>

        <div ref={imageRef} className="lg:col-span-7 relative aspect-[4/3] lg:aspect-[16/11]">
          <Image
            src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&q=85"
            alt="Curated wine collection"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 55vw"
          />
        </div>
      </div>
    </section>
  );
}
