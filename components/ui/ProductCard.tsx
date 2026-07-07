"use client";

import { useState } from "react";
import { m } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Eye, CheckCircle } from "@phosphor-icons/react";
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
  return `₦${value.toLocaleString("en-NG")}`;
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
  const [added, setAdded] = useState(false);

  function addToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (!product.inStock) return;

    cart.addItem({
      wineId: product._id,
      slug: product.slug,
      title: product.title,
      image,
      quantity: 1,
      unitPrice: product.price || 0,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  const hasDiscount = product.comparePrice && product.comparePrice > (product.price || 0);
  const discountPercent = hasDiscount && product.comparePrice && product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <m.article
      {...fadeUp}
      className={`group relative flex min-h-[400px] sm:min-h-[430px] flex-col justify-between border p-3 sm:p-4 md:p-5 transition-all duration-300 ${
        dark
          ? "border-white/10 bg-white/[0.04] text-cream hover:border-white/20"
          : "border-wine/10 bg-[#F8F4EA] text-ink hover:border-wine/30 hover:shadow-lg"
      }`}
      style={{ backgroundImage: `linear-gradient(145deg, ${withAlpha(accent, "28")}, transparent 52%)` }}
    >
      {/* Stock Status Badge */}
      {product.inStock && product.stockCount !== undefined && product.stockCount <= 5 && (
        <div className="absolute top-4 left-4 z-20 bg-gold text-dark text-xs font-semibold px-2 py-1 rounded-sm">
          Only {product.stockCount} left!
        </div>
      )}

      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-4 right-4 z-20 bg-wine text-cream text-xs font-bold px-2 py-1 rounded-sm">
          -{discountPercent}%
        </div>
      )}

      <Link href={`/wines/${product.slug}`} className="relative flex aspect-[4/5] items-center justify-center overflow-hidden">
        <div className="absolute inset-x-6 sm:inset-x-8 bottom-6 sm:bottom-8 h-16 sm:h-20 blur-3xl" style={{ backgroundColor: accent, opacity: 0.3 }} />
        <Image
          src={image}
          alt={product.image?.alt || product.title}
          width={520}
          height={720}
          priority={priority}
          className="relative z-10 h-full w-full object-contain p-3 sm:p-4 transition-transform duration-700 group-hover:-translate-y-2 group-hover:scale-105"
        />

        {/* Quick View Overlay */}
        <div className="absolute inset-0 z-20 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Link
            href={`/wines/${product.slug}`}
            className="inline-flex items-center gap-2 bg-cream text-ink px-4 py-2 text-sm font-medium hover:bg-wine hover:text-cream transition-colors"
          >
            <Eye size={16} />
            Quick View
          </Link>
        </div>
      </Link>

      <div className="mt-3 sm:mt-4 flex flex-col gap-2 sm:gap-3">
        <div>
          <div className={`mb-1.5 sm:mb-2 flex items-center justify-between gap-2 sm:gap-3 text-[10px] sm:text-[11px] uppercase ${dark ? "text-cream/45" : "text-wine/55"}`}>
            <span>{product.bottleSize || "N/A"}</span>
            <span>{product.abv || "N/A"}</span>
          </div>
          <Link href={`/wines/${product.slug}`}>
            <h3 className="font-serif text-sm sm:text-lg md:text-xl lg:text-2xl uppercase leading-tight hover:text-wine transition-colors">
              {product.title}
            </h3>
          </Link>
          <p className={`mt-1.5 sm:mt-2 text-xs sm:text-sm ${dark ? "text-cream/55" : "text-ink/58"}`}>
            {notes.join(" / ") || product.origin || product.region || "—"}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex flex-col">
            <p className={`font-serif text-base sm:text-lg md:text-xl ${dark ? "text-gold" : "text-wine"}`}>
              {formatNaira(product.price || 0)}
            </p>
            {hasDiscount && (
              <p className={`text-xs line-through ${dark ? "text-cream/40" : "text-ink/40"}`}>
                {formatNaira(product.comparePrice!)}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Stock Indicator */}
            {product.inStock ? (
              <div className="flex items-center gap-1 text-xs text-green-700">
                <CheckCircle size={14} />
                <span className="hidden sm:inline">In Stock</span>
              </div>
            ) : (
              <span className="text-xs text-red-600 font-medium">Out of Stock</span>
            )}
          </div>

          <button
            type="button"
            onClick={addToCart}
            disabled={!product.inStock || added}
            className={`inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center border transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
              dark
                ? "border-gold/50 text-gold hover:bg-gold hover:text-ink"
                : added
                  ? "border-green-600 bg-green-600 text-cream"
                  : "border-wine/35 text-wine hover:bg-wine hover:text-cream"
            }`}
            aria-label={`Add ${product.title} to cart`}
            title={`Add ${product.title} to cart`}
          >
            {added ? <CheckCircle size={16} className="sm:w-[18px] sm:h-[18px]" /> : <ShoppingBag size={16} className="sm:w-[18px] sm:h-[18px]" />}
          </button>
        </div>
      </div>
    </m.article>
  );
}
