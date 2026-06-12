"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";

const blocks = [
  {
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=85",
    imageLeft: true,
    eyebrow: "Same-Day Delivery",
    title: "From cellar to your door.",
    titleLine2: "In hours.",
    body: "We deliver across Lagos Island, Lekki, VI, Ikoyi, and Mainland — same day, temperature-controlled.",
    link: "Learn More →",
    href: "/contact",
  },
  {
    image:
      "https://images.unsplash.com/photo-1569400605346-1f748e4e21a8?w=900&q=85",
    imageLeft: false,
    eyebrow: "Curated Collections",
    title: "Gifts that speak",
    titleLine2: "without words.",
    body: "Custom curated boxes for every occasion. Birthdays, proposals, corporate gifting — packaged with intention.",
    link: "Learn More →",
    href: "/shop",
  },
  {
    image:
      "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=900&q=85",
    imageLeft: true,
    eyebrow: "Cellar Membership",
    title: "Access the rare.",
    titleLine2: "Before anyone else.",
    body: "Members get early access to limited releases, private tastings, and exclusive pricing.",
    link: "Join the List →",
    href: "/contact",
  },
];

function EditorialRow({
  block,
}: {
  block: (typeof blocks)[number];
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const imageFromX = block.imageLeft ? -50 : 50;
      const textFromX = block.imageLeft ? 30 : -30;

      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { opacity: 0, x: imageFromX },
          {
            opacity: 1,
            x: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: rowRef.current,
              start: "top 75%",
              once: true,
            },
          },
        );
      }

      if (textRef.current) {
        gsap.fromTo(
          textRef.current,
          { opacity: 0, x: textFromX },
          {
            opacity: 1,
            x: 0,
            duration: 1,
            delay: 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: rowRef.current,
              start: "top 75%",
              once: true,
            },
          },
        );
      }
    }, rowRef);

    return () => ctx.revert();
  }, [block.imageLeft]);

  const imageEl = (
    <div
      ref={imageRef}
      className="editorial-image-wrap relative aspect-[4/3] sm:aspect-[5/4] lg:min-h-[420px]"
    >
      <Image
        src={block.image}
        alt={block.eyebrow}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
    </div>
  );

  const textEl = (
    <div
      ref={textRef}
      className="flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-12 lg:py-16 bg-[#E8E4DC]/60 lg:bg-[#E8E4DC]/80"
    >
      <p className="text-eyebrow text-wine mb-5">{block.eyebrow}</p>
      <h3 className="font-display text-[clamp(28px,3.5vw,40px)] font-normal text-ink leading-[1.15] mb-5">
        {block.title}
        <br />
        {block.titleLine2}
      </h3>
      <p className="text-body text-ink/70 mb-6 max-w-md">{block.body}</p>
      <Link href={block.href} className="learn-more-link w-fit">
        {block.link}
      </Link>
    </div>
  );

  return (
    <div
      ref={rowRef}
      className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch"
    >
      {block.imageLeft ? (
        <>
          {imageEl}
          {textEl}
        </>
      ) : (
        <>
          <div className="lg:order-2">{imageEl}</div>
          <div className="lg:order-1">{textEl}</div>
        </>
      )}
    </div>
  );
}

export default function EditorialBlock() {
  return (
    <section className="bg-cream">
      {blocks.map((block) => (
        <EditorialRow key={block.eyebrow} block={block} />
      ))}
    </section>
  );
}
