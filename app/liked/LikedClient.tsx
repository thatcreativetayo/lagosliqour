"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ui/ProductCard";
import Button from "@/components/ui/Button";
import { useLikedStore } from "@/lib/stores/liked";
import { getLikedWines } from "@/lib/sanity/queries";
import type { WineCardResult } from "@/lib/sanity/types";

export default function LikedClient() {
  const liked = useLikedStore();
  const [wines, setWines] = useState<WineCardResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLikedWines() {
      if (liked.ids.length === 0) {
        setWines([]);
        setLoading(false);
        return;
      }

      try {
        const data = await getLikedWines(liked.ids);
        setWines(data);
      } catch (error) {
        console.error("Failed to fetch liked wines:", error);
        setWines([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLikedWines();
  }, [liked.ids]);

  if (loading) {
    return (
      <main className="bg-cream pt-20 sm:pt-24 pb-12 sm:pb-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16">
          <div className="text-center">
            <p className="text-sm sm:text-body text-ink/60">Loading your collection...</p>
          </div>
        </div>
      </main>
    );
  }

  if (wines.length === 0) {
    return (
      <main className="bg-cream pt-20 sm:pt-24 pb-12 sm:pb-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16">
          <div className="mb-8 sm:mb-12 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-ink uppercase">
              Liked Wines
            </h1>
            <p className="text-sm sm:text-body text-ink/60 mt-3 sm:mt-4 max-w-lg mx-auto px-4">
              Your collection is empty. Start saving wines you love.
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
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-ink uppercase">
            Liked Wines
          </h1>
          <p className="text-sm sm:text-body text-ink/60 mt-3 sm:mt-4 max-w-lg mx-auto px-4">
            {wines.length} {wines.length === 1 ? "wine" : "wines"} in your collection.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 lg:gap-8">
          {wines.map((wine) => (
            <ProductCard key={wine._id} product={wine} />
          ))}
        </div>
      </div>
    </main>
  );
}
