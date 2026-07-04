"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ui/ProductCard";
import type { WineCardResult, SanityCategory } from "@/lib/sanity/types";

interface ShopClientProps {
  wines: WineCardResult[];
  categories: SanityCategory[];
  initialCategory?: string;
  initialQuery?: string;
}

export default function ShopClient({ wines, categories, initialCategory, initialQuery }: ShopClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null);
  const [priceRange, setPriceRange] = useState<string>("all");
  const [availability, setAvailability] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery || "");
  const [sortBy, setSortBy] = useState<string>("featured");

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // Filter wines
  const filteredWines = wines.filter((wine) => {
    // Search filter
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        wine.title.toLowerCase().includes(searchLower) ||
        wine.name?.toLowerCase().includes(searchLower) ||
        wine.region?.toLowerCase().includes(searchLower) ||
        wine.category?.title.toLowerCase().includes(searchLower) ||
        wine.tastingNotes?.some((note) => note.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;
    }

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

  // Sort wines
  const sortedWines = [...filteredWines].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "name":
        return a.title.localeCompare(b.title);
      case "newest":
        return (b.vintage || 0) - (a.vintage || 0);
      default:
        return 0;
    }
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

        {/* Search Bar - Mobile Only */}
        <div className="mb-6 lg:hidden">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search wines..."
              className="w-full border-2 border-wine/20 bg-transparent px-4 py-3 text-ink focus:border-wine focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/60 hover:text-wine"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            )}
          </div>
          {(searchQuery || filteredWines.length !== wines.length) && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-ink/60">
                {searchQuery ? `Searching for "${searchQuery}"` : "Filters applied"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                  setPriceRange("all");
                  setAvailability("all");
                  setSortBy("featured");
                }}
                className="text-xs text-wine underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-16">
          {/* Filter Sidebar */}
          <aside className="space-y-6 lg:space-y-8">
            {/* Sort - Mobile */}
            <div className="lg:hidden">
              <label className="text-xs uppercase text-wine/70 block mb-2">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border-2 border-wine/20 bg-transparent px-3 py-2 text-sm focus:border-wine focus:outline-none"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
            {/* Search Bar - Desktop Only */}
            <div className="hidden lg:block">
              <h3 className="text-base sm:text-lg font-normal text-ink uppercase mb-3 sm:mb-4 border-b border-wine/20 pb-2">
                Search
              </h3>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search wines, regions..."
                  className="w-full border-2 border-wine/20 bg-transparent px-4 py-2.5 pr-10 text-sm text-ink placeholder:text-ink/40 focus:border-wine focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/60 hover:text-wine"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M6 6l12 12M6 18L18 6" />
                    </svg>
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="mt-2 text-xs text-ink/60">
                  Searching for "<span className="text-wine">{searchQuery}</span>"
                </p>
              )}
            </div>
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
            {(selectedCategory || priceRange !== "all" || availability !== "all" || searchQuery) ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory(null);
                  setPriceRange("all");
                  setAvailability("all");
                  setSearchQuery("");
                }}
                className="w-full border-2 border-wine text-wine py-2 hover:bg-wine hover:text-cream transition-all duration-300 text-sm uppercase"
              >
                Clear All Filters
              </button>
            ) : null}

            {/* Sort - Desktop */}
            <div className="hidden lg:block">
              <h3 className="text-base sm:text-lg font-normal text-ink uppercase mb-3 sm:mb-4 border-b border-wine/20 pb-2">
                Sort by
              </h3>
              <div className="space-y-1.5 sm:space-y-2">
                {[
                  { value: "featured", label: "Featured" },
                  { value: "price-low", label: "Price: Low to High" },
                  { value: "price-high", label: "Price: High to Low" },
                  { value: "name", label: "Name: A to Z" },
                  { value: "newest", label: "Newest First" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSortBy(option.value)}
                    className={`block w-full text-left px-3 py-2 text-sm transition-colors ${
                      sortBy === option.value
                        ? "bg-wine text-cream"
                        : "text-dark hover:bg-wine/5"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm text-ink/60">
                Showing {sortedWines.length} of {wines.length} wines
              </p>
              {/* Sort - Desktop Dropdown */}
              <div className="hidden lg:block">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border-2 border-wine/20 bg-transparent px-3 py-2 text-sm focus:border-wine focus:outline-none"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>
            {sortedWines.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
                {sortedWines.map((wine) => (
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
