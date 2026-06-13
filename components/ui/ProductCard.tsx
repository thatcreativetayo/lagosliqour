"use client";

import { m } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "@phosphor-icons/react";
import { urlFor } from "@/lib/sanity/client";
import type { WineCardResult } from "@/lib/sanity/types";
import { useCartStore } from "@/lib/stores/cart";

const ease = [0.25, 0.1, 0.25, 1] as const;
const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-90px" },
  transition: { duration: 0.72, ease },
};

function productImage(product: WineCardResult, width = 900) {
  const directUrl = product.image?.asset?.url;
  if (directUrl?.startsWith("/")) return directUrl;

  const src = urlFor(product.image).width(width).quality(90).url();
  return src || directUrl || "/hero.png";
}

function formatNaira(value: number) {
  return `NGN ${value.toLocaleString("en-NG")}`;
}

function withAlpha(hex = "#D8B25A", alpha = "26") {
  return `${hex}${alpha}`;
}

interface ProductCardProps {
  product: WineCardResult;
  priority?: boolean;
  dark?: boolean;
}

export default function ProductCard({ product, priority = false, dark = false }: ProductCardProps) {
  const cart = useCartStore();
  const image = productImage(product, 700);
  const accent = product.accentColor ?? "#D8B25A";
  const notes = product.tastingNotes?.slice(0, 3) ?? [];

  function addToCart() {
    if (!product.inStock) return;
    cart.addItem({
      wineId: product._id,
      slug: product.slug,
      title: product.title,
      image,
      quantity: 1,
      unitPrice: product.price,
    });
  }

  return (
    <m.article
      {...fadeUp}
      className={`group flex min-h-[430px] flex-col justify-between border p-4 transition-colors duration-500 sm:p-5 ${
        dark ? "border-white/10 bg-white/[0.04] text-cream" : "border-wine/10 bg-[#F8F4EA] text-ink"
      }`}
      style={{ backgroundImage: `linear-gradient(145deg, ${withAlpha(accent, "28")}, transparent 52%)` }}
    >
      <Link href={`/wines/${product.slug}`} className="relative flex aspect-[4/5] items-center justify-center overflow-hidden">
        <div className="absolute inset-x-8 bottom-8 h-20 blur-3xl" style={{ backgroundColor: accent, opacity: 0.3 }} />
        <Image
          src={image}
          alt={product.image?.alt || product.title}
          width={520}
          height={720}
          priority={priority}
          className="relative z-10 h-full w-full object-contain p-4 transition-transform duration-700 group-hover:-translate-y-2 group-hover:scale-105"
        />
      </Link>

      <div className="mt-4 flex flex-col gap-4">
        <div>
          <div className={`mb-2 flex items-center justify-between gap-3 text-[11px] uppercase ${dark ? "text-cream/45" : "text-wine/55"}`}>
            <span>{product.bottleSize}</span>
            <span>{product.abv ?? "40%"}</span>
          </div>
          <Link href={`/wines/${product.slug}`}>
            <h3 className="font-serif text-2xl uppercase leading-tight">{product.title}</h3>
          </Link>
          <p className={`mt-2 text-sm ${dark ? "text-cream/55" : "text-ink/58"}`}>
            {notes.join(" / ") || product.origin || product.region}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className={`font-serif text-xl ${dark ? "text-gold" : "text-wine"}`}>{formatNaira(product.price)}</p>
          <button
            type="button"
            onClick={addToCart}
            disabled={!product.inStock}
            className={`inline-flex h-10 w-10 items-center justify-center border transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              dark ? "border-gold/50 text-gold hover:bg-gold hover:text-ink" : "border-wine/35 text-wine hover:bg-wine hover:text-cream"
            }`}
            aria-label={`Add ${product.title} to cart`}
            title={`Add ${product.title} to cart`}
          >
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>
    </m.article>
  );
}
