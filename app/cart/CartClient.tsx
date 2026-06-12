"use client";

import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Minus, Plus, Trash } from "@hugeicons/core-free-icons";
import { useCartStore } from "@/lib/stores/cart";
import Button from "@/components/ui/Button";

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
        </div>
        
        <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8">
          {cart.items.map((item) => (
            <div key={item.wineId} className="w-full flex flex-col sm:flex-row bg-wine/5 p-4 sm:p-5 gap-4 sm:gap-5">
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
                  </div>
                  <button
                    type="button"
                    aria-label="Remove from cart"
                    onClick={() => cart.removeItem(item.wineId)}
                    className="border border-wine hover:bg-wine transition-all duration-300 hover:text-cream text-wine p-2 sm:p-2.5 cursor-pointer shrink-0"
                  >
                    <HugeiconsIcon icon={Trash} strokeWidth={2} className="size-4" />
                  </button>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3 sm:gap-4">
                  <p className="text-dark text-lg sm:text-xl lg:text-2xl font-medium">
                    ₦{item.unitPrice.toLocaleString()}
                  </p>
                  
                  <div className="flex justify-between sm:justify-start w-full sm:w-fit gap-4 sm:gap-7 items-center">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => {
                        if (item.quantity > 1) {
                          cart.updateQuantity(item.wineId, item.quantity - 1);
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
                      onClick={() => cart.updateQuantity(item.wineId, item.quantity + 1)}
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
          ))}
        </div>
        
        <div className="justify-end flex mt-6 sm:mt-8">
          <p className="font-semibold text-wine text-2xl sm:text-3xl lg:text-4xl">
            SUBTOTAL: ₦{cart.subtotal.toLocaleString()}
          </p>
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
