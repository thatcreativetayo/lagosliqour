"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import Image from "next/image";
import type { WineCardResult } from "@/lib/sanity/types";

interface SearchBarProps {
  wines?: WineCardResult[];
}

export default function SearchBar({ wines = [] }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<WineCardResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (query.trim().length > 0) {
      const filtered = wines.filter((wine) => {
        const searchLower = query.toLowerCase();
        return (
          wine.title.toLowerCase().includes(searchLower) ||
          wine.name?.toLowerCase().includes(searchLower) ||
          wine.region?.toLowerCase().includes(searchLower) ||
          wine.category?.title.toLowerCase().includes(searchLower) ||
          wine.tastingNotes?.some((note) => note.toLowerCase().includes(searchLower))
        );
      });
      setResults(filtered.slice(0, 6));
    } else {
      setResults([]);
    }
  }, [query, wines]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
      setShowResults(false);
      setQuery("");
    }
  }

  function handleResultClick(wine: WineCardResult) {
    router.push(`/wines/${wine.slug}`);
    setShowResults(false);
    setQuery("");
  }

  function getImageUrl(wine: WineCardResult) {
    if (wine.bottleImage?.asset?.url) return wine.bottleImage.asset.url;
    if (wine.image?.asset?.url) return wine.image.asset.url;
    return "/placeholder-bottle.jpg";
  }

  return (
    <div ref={containerRef} className="relative z-50 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
      {/* Search Input - Always Visible */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative flex items-center">
          {/* Search Icon */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-wine/60 pointer-events-none">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            placeholder="Search wines, regions..."
            className="w-full bg-white border-2 border-wine/20 hover:border-wine/40 focus:border-wine focus:bg-cream pl-9 pr-8 py-2 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-wine/20 rounded-sm text-sm transition-all duration-200 font-sans shadow-sm"
          />

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setShowResults(false);
                inputRef.current?.focus();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-ink/40 hover:text-wine transition-colors rounded-full hover:bg-wine/10"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* Dropdown Results */}
      <AnimatePresence>
        {showResults && query.trim() && (
          <m.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-full sm:w-80 bg-cream border border-wine/20 shadow-xl rounded-sm overflow-hidden z-50"
          >
            {results.length > 0 ? (
              <>
                <div className="px-3 py-2 bg-wine/5 border-b border-wine/10">
                  <p className="text-xs text-ink/60 font-sans">
                    {results.length} result{results.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                  {results.map((wine, index) => (
                    <m.button
                      key={wine._id}
                      type="button"
                      onClick={() => handleResultClick(wine)}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-wine/5 transition-colors text-left border-b border-wine/5 last:border-b-0"
                    >
                      <div className="relative w-12 h-12 flex-shrink-0 bg-wine/5 rounded overflow-hidden">
                        <Image
                          src={getImageUrl(wine)}
                          alt={wine.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{wine.title}</p>
                        <p className="text-xs text-ink/60 truncate">
                          {wine.region} • {wine.category?.title}
                        </p>
                      </div>
                      <div className="text-sm font-semibold text-wine flex-shrink-0">
                        ₦{((wine.price || 0) / 1000).toFixed(0)}k
                      </div>
                    </m.button>
                  ))}
                </div>
                <div className="p-2 bg-wine/5 border-t border-wine/10">
                  <button
                    type="button"
                    onClick={() => {
                      router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
                      setShowResults(false);
                      setQuery("");
                    }}
                    className="w-full py-2 text-sm text-wine hover:text-wine/80 text-center font-medium transition-colors"
                  >
                    View all results →
                  </button>
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-ink/60">No results found</p>
                <p className="text-xs text-ink/40 mt-1">Try "Red Wine" or "Champagne"</p>
              </div>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
