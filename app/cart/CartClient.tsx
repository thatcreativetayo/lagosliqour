"use client";

import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Minus, Plus, Trash } from "@hugeicons/core-free-icons";
import { useCartStore } from "@/lib/stores/cart";
import Button from "@/components/ui/Button";
import type { CartItem } from "@/lib/stores/cart";

function PackSizeBadge({ packSize }: { packSize?: number }) {
  if (!packSize || packSize === 1) return null;
  return (
    <span className="inline-flex items-center gap-1 bg-wine text-cream text-xs px-2 py-1 rounded-sm">
      <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
      </svg>
      Pack of {packSize}
    </span>
  );
}

export default function CartClient() {
  const cart = useCartStore();

  if (cart.items.length === 0) {
    return (
      <main className="bg-cream pt-20 sm:pt-24 pb-12 sm:pb-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16">
          <div className="mb-8 sm:mb-12 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-ink uppercase">Your Cart</h1>
            <p className="text-sm sm:text-body text-ink/60 mt-3 sm:mt-4 max-w-lg mx-auto px-4">
              Your cart is empty. Start adding wines to your collection.
            </p>
          </div>
          <div className="flex justify-center">
            <Button href="/shop" variant="filled">
              Browse Wines
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-cream pt-20 sm:pt-24 pb-12 sm:pb-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16">
        <div className="mb-8 sm:mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-ink uppercase">Your Cart</h1>
          <p className="text-sm text-ink/60 mt-2">
            {cart.items.length} item{cart.items.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8">
          {cart.items.map((item) => {
            const uniqueId = cart.getCartItemUniqueId(item);
            const isPack = item.packSize && item.packSize > 1;

            return (
              <div key={uniqueId} className="w-full flex flex-col sm:flex-row bg-wine/5 p-4 sm:p-5 gap-4 sm:gap-5">
                <div className="relative w-full sm:w-40 aspect-square sm:aspect-auto flex items-center justify-center mx-auto sm:mx-0">
                  <div className="absolute inset-4 bg-wine/10" />
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={400}
                      height={400}
                      className="object-contain relative z-10 w-48 sm:w-64 h-auto"
                    />
                  ) : null}
                </div>

                <div className="flex flex-col justify-between w-full gap-4">
                  <div className="flex items-start justify-between w-full gap-3 sm:gap-4">
                    <div className="flex flex-col gap-2 sm:gap-3">
                      <Link href={`/wines/${item.slug}`}>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl text-wine uppercase hover:text-wine/80 transition-colors">
                          {item.title}
                        </h2>
                      </Link>
                      <PackSizeBadge packSize={item.packSize} />
                      {isPack && (
                        <p className="text-xs text-green-700">
                          ₦{(item.unitPrice * 1).toFixed(0)} per bottle (you saved ₦{(
                            (item.unitPrice * 1 * item.packSize!) - (item.unitPrice * item.quantity)
                          ).toLocaleString()})
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      aria-label="Remove from cart"
                      onClick={() => cart.removeItem(uniqueId)}
                      className="border border-wine hover:bg-wine transition-all duration-300 hover:text-cream text-wine p-2 sm:p-2.5 cursor-pointer shrink-0"
                    >
                      <HugeiconsIcon icon={Trash} strokeWidth={2} className="size-4" />
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3 sm:gap-4">
                    <div>
                      <p className="text-dark text-lg sm:text-xl lg:text-2xl font-medium">
                        ₦{item.unitPrice.toLocaleString()}
                        <span className="text-sm text-ink/60 font-normal ml-2">
                          {isPack ? `per bottle` : "per bottle"}
                        </span>
                      </p>
                      {isPack && (
                        <p className="text-xs text-ink/60 mt-1">
                          {item.quantity} bottles × ₦{item.unitPrice.toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between sm:justify-start w-full sm:w-fit gap-4 sm:gap-7 items-center">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => {
                          if (item.quantity > 1) {
                            cart.updateQuantity(uniqueId, item.quantity - 1);
                          }
                        }}
                        className="border border-wine hover:bg-wine transition-all duration-300 hover:text-cream text-wine p-2 sm:p-2.5 cursor-pointer"
                      >
                        <HugeiconsIcon icon={Minus} strokeWidth={2} className="size-4" />
                      </button>
                      <p className="text-wine text-base sm:text-lg font-semibold min-w-6 text-center">
                        {item.quantity}
                      </p>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => cart.updateQuantity(uniqueId, item.quantity + 1)}
                        className="border border-wine hover:bg-wine transition-all duration-300 hover:text-cream text-wine p-2 sm:p-2.5 cursor-pointer"
                      >
                        <HugeiconsIcon icon={Plus} strokeWidth={2} className="size-4" />
                      </button>
                    </div>

                    <p className="text-wine text-xl sm:text-2xl lg:text-3xl font-semibold">
                      ₦{item.lineTotal.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="justify-end flex mt-6 sm:mt-8">
          <div className="text-right">
            <p className="text-sm text-ink/60">Subtotal</p>
            <p className="font-semibold text-wine text-2xl sm:text-3xl lg:text-4xl">
              ₦{cart.subtotal.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row w-full justify-between mt-6 sm:mt-8 gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => cart.clearCart()}
            className="border-2 border-wine text-wine cursor-pointer py-2.5 sm:py-3 px-6 sm:px-10 hover:bg-wine hover:text-cream transition-all duration-300 text-sm sm:text-base"
          >
            Clear Cart
          </button>
          <Link
            href="/checkout"
            className="border-2 border-wine bg-wine text-cream cursor-pointer py-2.5 sm:py-3 px-6 sm:px-10 hover:bg-transparent hover:text-wine transition-all duration-300 text-center text-sm sm:text-base"
          >
            Checkout
          </Link>
        </div>
      </div>
    </main>
  );
}
