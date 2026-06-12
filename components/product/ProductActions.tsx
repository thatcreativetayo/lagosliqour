"use client";

import { Minus, Plus } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/lib/stores/cart";

interface ProductActionsProps {
  wine: {
    wineId: string;
    slug: string;
    title: string;
    image?: string;
    price: number;
    inStock: boolean;
    stockCount?: number;
  };
}

export default function ProductActions({ wine }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");
  const cart = useCartStore();
  const maxQuantity = wine.stockCount && wine.stockCount > 0 ? wine.stockCount : 99;

  function addToCart() {
    if (!wine.inStock) {
      setError("This product is out of stock");
      return;
    }

    if (quantity > maxQuantity) {
      setError(`Only ${maxQuantity} available in stock`);
      return;
    }

    cart.addItem({
      wineId: wine.wineId,
      slug: wine.slug,
      title: wine.title,
      image: wine.image,
      quantity,
      unitPrice: wine.price,
    });
    setAdded(true);
    setError("");
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="flex flex-col gap-4">
      {!wine.inStock ? (
        <div className="bg-wine/10 border border-wine/20 p-4 text-center">
          <p className="text-wine font-medium">Out of Stock</p>
          <p className="text-xs text-ink/60 mt-1">This item is currently unavailable</p>
        </div>
      ) : null}

      {wine.inStock && wine.stockCount && wine.stockCount < 10 ? (
        <div className="bg-gold/10 border border-gold/20 p-3 text-center">
          <p className="text-xs text-dark">Only {wine.stockCount} left in stock!</p>
        </div>
      ) : null}

      {error ? (
        <div className="bg-wine/10 border border-wine/20 p-3 text-center">
          <p className="text-xs text-wine">{error}</p>
        </div>
      ) : null}

      <div className="flex justify-between w-fit gap-7 items-center">
        <button
          type="button"
          aria-label="Decrease quantity"
          onClick={() => {
            setQuantity((value) => Math.max(1, value - 1));
            setError("");
          }}
          className="border border-wine hover:bg-wine transition-all duration-300 hover:text-cream text-wine p-2.5 cursor-pointer"
        >
          <HugeiconsIcon icon={Minus} strokeWidth={2} className="size-4" />
        </button>
        <p className="text-wine text-lg font-semibold min-w-6 text-center">{quantity}</p>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => {
            if (quantity < maxQuantity) {
              setQuantity((value) => value + 1);
              setError("");
            } else {
              setError(`Only ${maxQuantity} available in stock`);
            }
          }}
          className="border border-wine hover:bg-wine transition-all duration-300 hover:text-cream text-wine p-2.5 cursor-pointer"
        >
          <HugeiconsIcon icon={Plus} strokeWidth={2} className="size-4" />
        </button>
      </div>

      <Button
        onClick={addToCart}
        disabled={!wine.inStock}
        className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {wine.inStock ? (added ? "Added to Cart" : "Add to Cart") : "Out of Stock"}
      </Button>
    </div>
  );
}
