"use client";

import { useState } from "react";
import ProductCard from "@/components/ui/ProductCard";
import type { WineCardResult, SanityCategory } from "@/lib/sanity/types";

interface ShopClientProps {
  wines: WineCardResult[];
  categories: SanityCategory[];
}

export default function ShopClient({ wines, categories }: ShopClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<string>("all");
  const [availability, setAvailability] = useState<string>("all");

  // Filter wines
  const filteredWines = wines.filter((wine) => {
    // Category filter
    if (selectedCategory && wine.category?.slug !== selectedCategory) {
      return false;
    }

    // Price range filter
    if (priceRange === "under-50k" && wine.price >= 50000) return false;
    if (priceRange === "50k-100k" && (wine.price < 50000 || wine.price >= 100000)) return false;
    if (priceRange === "over-100k" && wine.price < 100000) return false;

    // Availability filter
    if (availability === "in-stock" && !wine.inStock) return false;
    if (availability === "low-stock" && (wine.stockCount || 99) >= 10) return false;

    return true;
  });

  return (
    <main className="bg-cream pt-20 sm:pt-24 pb-12 sm:pb-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16">
        <div className="mb-8 sm:mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-ink uppercase">
            The Collection
          </h1>
          <p className="text-sm sm:text-body text-ink/60 mt-3 sm:mt-4 max-w-lg mx-auto px-4">
            Every bottle hand-selected for the Lagos palate. Temperature controlled
            from cellar to door.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-16">
          {/* Filter Sidebar */}
          <aside className="space-y-6 lg:space-y-8">
            {/* Category Filter */}
            <div>
              <h3 className="text-base sm:text-lg font-normal text-ink uppercase mb-3 sm:mb-4 border-b border-wine/20 pb-2">
                Category
              </h3>
              <div className="space-y-1.5 sm:space-y-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className={`block w-full text-left px-3 py-2 text-sm transition-colors ${
                    selectedCategory === null
                      ? "bg-wine text-cream"
                      : "text-dark hover:bg-wine/5"
                  }`}
                >
                  All Wines ({wines.length})
                </button>
                {categories.map((category) => {
                  const count = wines.filter((w) => w.category?.slug === category.slug).length;
                  return (
                    <button
                      key={category._id}
                      type="button"
                      onClick={() => setSelectedCategory(category.slug)}
                      className={`block w-full text-left px-3 py-2 text-sm transition-colors ${
                        selectedCategory === category.slug
                          ? "bg-wine text-cream"
                          : "text-dark hover:bg-wine/5"
                      }`}
                    >
                      {category.title} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <h3 className="text-base sm:text-lg font-normal text-ink uppercase mb-3 sm:mb-4 border-b border-wine/20 pb-2">
                Price Range
              </h3>
              <div className="space-y-1.5 sm:space-y-2">
                <button
                  type="button"
                  onClick={() => setPriceRange("all")}
                  className={`block w-full text-left px-3 py-2 text-sm transition-colors ${
                    priceRange === "all"
                      ? "bg-wine text-cream"
                      : "text-dark hover:bg-wine/5"
                  }`}
                >
                  All Prices
                </button>
                <button
                  type="button"
                  onClick={() => setPriceRange("under-50k")}
                  className={`block w-full text-left px-3 py-2 text-sm transition-colors ${
                    priceRange === "under-50k"
                      ? "bg-wine text-cream"
                      : "text-dark hover:bg-wine/5"
                  }`}
                >
                  Under ₦50,000
                </button>
                <button
                  type="button"
                  onClick={() => setPriceRange("50k-100k")}
                  className={`block w-full text-left px-3 py-2 text-sm transition-colors ${
                    priceRange === "50k-100k"
                      ? "bg-wine text-cream"
                      : "text-dark hover:bg-wine/5"
                  }`}
                >
                  ₦50,000 - ₦100,000
                </button>
                <button
                  type="button"
                  onClick={() => setPriceRange("over-100k")}
                  className={`block w-full text-left px-3 py-2 text-sm transition-colors ${
                    priceRange === "over-100k"
                      ? "bg-wine text-cream"
                      : "text-dark hover:bg-wine/5"
                  }`}
                >
                  Over ₦100,000
                </button>
              </div>
            </div>

            {/* Availability Filter */}
            <div>
              <h3 className="text-base sm:text-lg font-normal text-ink uppercase mb-3 sm:mb-4 border-b border-wine/20 pb-2">
                Availability
              </h3>
              <div className="space-y-1.5 sm:space-y-2">
                <button
                  type="button"
                  onClick={() => setAvailability("all")}
                  className={`block w-full text-left px-3 py-2 text-sm transition-colors ${
                    availability === "all"
                      ? "bg-wine text-cream"
                      : "text-dark hover:bg-wine/5"
                  }`}
                >
                  All Products
                </button>
                <button
                  type="button"
                  onClick={() => setAvailability("in-stock")}
                  className={`block w-full text-left px-3 py-2 text-sm transition-colors ${
                    availability === "in-stock"
                      ? "bg-wine text-cream"
                      : "text-dark hover:bg-wine/5"
                  }`}
                >
                  In Stock
                </button>
                <button
                  type="button"
                  onClick={() => setAvailability("low-stock")}
                  className={`block w-full text-left px-3 py-2 text-sm transition-colors ${
                    availability === "low-stock"
                      ? "bg-wine text-cream"
                      : "text-dark hover:bg-wine/5"
                  }`}
                >
                  Low Stock ({"<"}10)
                </button>
              </div>
            </div>

            {/* Clear Filters */}
            {(selectedCategory || priceRange !== "all" || availability !== "all") ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory(null);
                  setPriceRange("all");
                  setAvailability("all");
                }}
                className="w-full border-2 border-wine text-wine py-2 hover:bg-wine hover:text-cream transition-all duration-300 text-sm uppercase"
              >
                Clear All Filters
              </button>
            ) : null}
          </aside>

          {/* Products Grid */}
          <div>
            <p className="text-xs sm:text-sm text-ink/60 mb-4 sm:mb-6">
              Showing {filteredWines.length} of {wines.length} wines
            </p>
            {filteredWines.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
                {filteredWines.map((wine) => (
                  <ProductCard key={wine._id} product={wine} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-20">
                <p className="text-xl sm:text-2xl text-ink/60 mb-3 sm:mb-4">No wines found</p>
                <p className="text-sm sm:text-body text-ink/40 mb-4 sm:mb-6">
                  Try adjusting your filters
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory(null);
                    setPriceRange("all");
                    setAvailability("all");
                  }}
                  className="border-2 border-wine bg-wine text-cream px-6 sm:px-8 py-2.5 sm:py-3 hover:bg-transparent hover:text-wine transition-all duration-300 text-sm"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
