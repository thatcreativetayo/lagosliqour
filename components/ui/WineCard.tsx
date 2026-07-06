"use client";

import { m } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { WineCardResult } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/client";
import { useCartStore } from "@/lib/stores/cart";
import { useLikedStore } from "@/lib/stores/liked";
import type { Wine } from "@/lib/types/wine";
import LikeButton from "./LikeButton";
import Tag from "./Tag";

interface WineCardProps {
  wine: Wine | WineCardResult;
}

export default function WineCard({ wine }: WineCardProps) {
  const cart = useCartStore();
  const liked = useLikedStore();
  const isSanityWine = "_id" in wine;
  const id = isSanityWine ? wine._id : wine.id;
  const title = isSanityWine ? wine.title : wine.name;
  const slug = isSanityWine ? wine.slug : wine.id;
  const category = isSanityWine ? wine.category?.title : wine.category;
  const image = isSanityWine
    ? urlFor(wine.image).width(700).quality(85).url()
    : wine.image;
  const href = `/wines/${slug}`;
  const accentColor = isSanityWine && wine.accentColor ? wine.accentColor : "#6d1b1a";
  const isLiked = liked.isLiked(id);
  const inStock = isSanityWine ? wine.inStock !== false : true;
  const stockCount = isSanityWine && wine.stockCount ? wine.stockCount : 99;

  function addToCart() {
    if (!inStock) return;
    cart.addItem({
      wineId: id,
      slug,
      title,
      image,
      quantity: 1,
      unitPrice: wine.price || 0,
    });
  }

  return (
    <m.article
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      className="bg-transparent flex flex-col"
    >
      <Link 
        href={href} 
        className="relative aspect-square flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: `${accentColor}15` }}
      >
        <div 
          className="absolute inset-0 opacity-20"
          style={{ backgroundColor: accentColor }}
        />
        {image ? (
          <Image
            src={image}
            alt={title}
            width={400}
            height={400}
            className="object-contain relative z-10 w-full h-auto p-4 sm:p-6"
          />
        ) : null}
        {!inStock ? (
          <div className="absolute inset-0 bg-ink/50 flex items-center justify-center z-20">
            <p className="text-cream text-xs sm:text-sm uppercase font-medium">Out of Stock</p>
          </div>
        ) : null}
      </Link>
      <div className="pb-6 sm:pb-8 flex pt-3 sm:pt-4 flex-col gap-1">
        {category ? <Tag>{category}</Tag> : null}
        <Link href={href}>
          <h3 className="font-serif text-base sm:text-[20px] uppercase font-normal text-ink leading-tight">
            {title}
          </h3>
        </Link>
        <p className="font-serif text-sm sm:text-[17px] font-medium text-ink/60 mt-0.5 sm:mt-1">
          ₦{(wine.price || 0).toLocaleString()}
        </p>
        {isSanityWine && stockCount < 10 && stockCount > 0 ? (
          <p className="text-xs text-wine">Only {stockCount} left in stock</p>
        ) : null}
        <div className="flex gap-2 sm:gap-3 mt-2 sm:mt-3">
          <button
            type="button"
            onClick={addToCart}
            disabled={!inStock}
            className="bg-wine hover:bg-transparent group transition-all border-2 border-wine hover:text-wine duration-300 py-1.5 sm:py-2.25 text-center text-cream w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
          >
            {inStock ? "Add to cart" : "Out of Stock"}
          </button>
          <LikeButton wineId={id} />
        </div>
      </div>
    </m.article>
  );
}
