"use client";

import { Minus, Plus } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/lib/stores/cart";

interface ProductActionsProps {
  wine: {
    wineId: string;
    slug?: string;
    title: string;
    image?: string;
    price?: number;
    inStock?: boolean;
    stockCount?: number;
  };
}

type PackSize = "single" | "pack";

const PACK_DISCOUNT = 0.02; // 2% discount for packs

export default function ProductActions({ wine }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const [packSize, setPackSize] = useState<PackSize>("single");
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");
  const cart = useCartStore();

  // Calculate prices based on pack size
  const singlePrice = wine.price || 0;
  const packPrice = Math.round((wine.price || 0) * 6 * (1 - PACK_DISCOUNT));
  const currentPrice = packSize === "single" ? singlePrice : packPrice;
  const savings = packSize === "pack" ? Math.round((wine.price || 0) * 6 - packPrice) : 0;

  // Calculate max quantity based on stock and pack size
  const getEffectiveQuantity = () => {
    if (packSize === "single") return quantity;
    return quantity * 6;
  };

  const maxSingleBottles = wine.stockCount && wine.stockCount > 0 ? wine.stockCount : 99;
  const maxQuantity = packSize === "single"
    ? maxSingleBottles
    : Math.floor(maxSingleBottles / 6);

  function addToCart() {
    if (wine.inStock === false) {
      setError("This product is out of stock");
      return;
    }

    const effectiveQuantity = getEffectiveQuantity();
    if (effectiveQuantity > maxSingleBottles) {
      setError(`Only ${maxSingleBottles} bottles available in stock`);
      return;
    }

    cart.addItem({
      wineId: wine.wineId,
      slug: wine.slug,
      title: wine.title,
      image: wine.image,
      quantity: effectiveQuantity,
      unitPrice: currentPrice / (packSize === "single" ? 1 : 6),
      packSize: packSize === "pack" ? 6 : 1,
    });
    setAdded(true);
    setError("");
    window.setTimeout(() => setAdded(false), 1800);
  }

  function handlePackSizeChange(size: PackSize) {
    setPackSize(size);
    setError("");
    // Reset quantity when changing pack size to avoid confusion
    setQuantity(1);
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {wine.inStock === false ? (
        <div className="bg-wine/10 border border-wine/20 p-4 text-center">
          <p className="text-wine font-medium">Out of Stock</p>
          <p className="text-xs text-ink/60 mt-1">This item is currently unavailable</p>
        </div>
      ) : null}

      {wine.inStock !== false && wine.stockCount && wine.stockCount < 10 ? (
        <div className="bg-gold/10 border border-gold/20 p-3 text-center">
          <p className="text-xs text-dark">Only {wine.stockCount} left in stock!</p>
        </div>
      ) : null}

      {error ? (
        <div className="bg-wine/10 border border-wine/20 p-3 text-center">
          <p className="text-xs text-wine">{error}</p>
        </div>
      ) : null}

      {/* Pack Size Selector */}
      <div>
        <p className="text-xs uppercase text-wine/70 mb-2">Select Pack Size</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handlePackSizeChange("single")}
            className={`p-3 border-2 text-center transition-all duration-200 ${
              packSize === "single"
                ? "border-wine bg-wine text-cream"
                : "border-wine/20 text-ink hover:border-wine/50"
            }`}
          >
            <p className="text-sm font-medium">Single Bottle</p>
            <p className="text-xs opacity-80 mt-0.5">₦{singlePrice.toLocaleString()}</p>
          </button>
          <button
            type="button"
            onClick={() => handlePackSizeChange("pack")}
            className={`p-3 border-2 text-center transition-all duration-200 relative ${
              packSize === "pack"
                ? "border-wine bg-wine text-cream"
                : "border-wine/20 text-ink hover:border-wine/50"
            }`}
          >
            {savings > 0 && packSize !== "pack" && (
              <span className="absolute -top-2 -right-2 bg-gold text-dark text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                Save ₦{savings.toLocaleString()}
              </span>
            )}
            <p className="text-sm font-medium">Pack of 6</p>
            <p className="text-xs opacity-80 mt-0.5">
              ₦{packPrice.toLocaleString()}
              {savings > 0 && <span className="line-through opacity-60 ml-2">₦{((wine.price || 0) * 6).toLocaleString()}</span>}
            </p>
          </button>
        </div>
        {packSize === "pack" && savings > 0 && (
          <p className="text-xs text-green-700 mt-2 flex items-center gap-1">
            <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            You save ₦{savings.toLocaleString()} ({Math.round(PACK_DISCOUNT * 100)}% off)
          </p>
        )}
      </div>

      {/* Quantity Selector */}
      <div>
        <p className="text-xs uppercase text-wine/70 mb-2">
          Quantity {packSize === "pack" ? `(${getEffectiveQuantity()} bottles)` : ""}
        </p>
        <div className="flex justify-between w-fit gap-6 sm:gap-7 items-center">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => {
              setQuantity((value) => Math.max(1, value - 1));
              setError("");
            }}
            className="border border-wine hover:bg-wine transition-all duration-300 hover:text-cream text-wine p-2 sm:p-2.5 cursor-pointer"
          >
            <HugeiconsIcon icon={Minus} strokeWidth={2} className="size-4" />
          </button>
          <p className="text-wine text-lg sm:text-xl font-semibold min-w-6 text-center">
            {quantity} {packSize === "pack" && <span className="text-sm text-ink/60">packs</span>}
          </p>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => {
              if (quantity < maxQuantity) {
                setQuantity((value) => value + 1);
                setError("");
              } else {
                const available = packSize === "single"
                  ? maxSingleBottles
                  : Math.floor(maxSingleBottles / 6);
                setError(`Only ${available} ${packSize === "single" ? "bottle" : "pack"}${available !== 1 ? "s" : ""} available`);
              }
            }}
            className="border border-wine hover:bg-wine transition-all duration-300 hover:text-cream text-wine p-2 sm:p-2.5 cursor-pointer"
          >
            <HugeiconsIcon icon={Plus} strokeWidth={2} className="size-4" />
          </button>
        </div>
      </div>

      {/* Total Price Display */}
      <div className="bg-wine/5 border border-wine/20 p-3 flex justify-between items-center">
        <span className="text-sm text-ink/70">Total</span>
        <span className="text-lg font-semibold text-wine">
          ₦{(currentPrice * quantity).toLocaleString()}
        </span>
      </div>

      <Button
        onClick={addToCart}
        disabled={wine.inStock === false}
        className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {wine.inStock !== false ? (added ? "Added to Cart" : "Add to Cart") : "Out of Stock"}
      </Button>

      {/* Stock Notice */}
      {wine.inStock !== false && wine.stockCount && wine.stockCount > 0 && (
        <p className="text-xs text-center text-ink/50">
          {packSize === "single" ? wine.stockCount : Math.floor(wine.stockCount / 6)} {packSize === "single" ? "bottle" : "pack"}
          {packSize === "single" ? wine.stockCount !== 1 : Math.floor(wine.stockCount / 6) !== 1 ? "s" : ""} available
        </p>
      )}
    </div>
  );
}
