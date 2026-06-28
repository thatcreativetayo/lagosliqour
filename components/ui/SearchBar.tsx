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
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
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
          wine.region.toLowerCase().includes(searchLower) ||
          wine.category?.title.toLowerCase().includes(searchLower) ||
          wine.tastingNotes?.some((note) => note.toLowerCase().includes(searchLower))
        );
      });
      setResults(filtered.slice(0, 8)); // Limit to 8 results
    } else {
      setResults([]);
    }
  }, [query, wines]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery("");
    }
  }

  function handleResultClick(wine: WineCardResult) {
    router.push(`/wines/${wine.slug}`);
    setIsOpen(false);
    setQuery("");
  }

  function getImageUrl(wine: WineCardResult) {
    if (wine.bottleImage?.asset?.url) return wine.bottleImage.asset.url;
    if (wine.image?.asset?.url) return wine.image.asset.url;
    return "/placeholder-bottle.jpg";
  }

  return (
    <div ref={containerRef} className="relative z-50">
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="p-2 -ml-2 text-ink hover:text-wine transition-colors"
        aria-label="Search"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ink/20 backdrop-blur-sm z-[-1]"
              onClick={() => setIsOpen(false)}
            />

            <m.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute top-0 right-0 w-[90vw] sm:w-96 bg-cream border-2 border-wine shadow-lg rounded-sm overflow-hidden"
            >
              <form onSubmit={handleSearch} className="p-4 border-b border-wine/10">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search wines, regions, tasting notes..."
                    className="w-full bg-transparent border-2 border-wine/20 px-4 py-2.5 pr-10 text-ink placeholder:text-ink/40 focus:border-wine focus:outline-none text-sm"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-ink/60 hover:text-wine transition-colors p-1"
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                  </button>
                </div>
              </form>

              {query.trim() && (
                <div className="max-h-[60vh] overflow-y-auto">
                  {results.length > 0 ? (
                    <div className="p-2">
                      {results.map((wine) => (
                        <button
                          key={wine._id}
                          type="button"
                          onClick={() => handleResultClick(wine)}
                          className="w-full flex items-center gap-3 p-2 hover:bg-wine/5 transition-colors rounded-sm text-left"
                        >
                          <div className="relative w-12 h-12 flex-shrink-0 bg-wine/5 rounded-sm overflow-hidden">
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
                          <div className="text-sm font-medium text-wine flex-shrink-0">
                            ₦{(wine.price / 1000).toFixed(0)}k
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-ink/60 mb-1">No results found</p>
                      <p className="text-xs text-ink/40">Try different keywords</p>
                    </div>
                  )}
                </div>
              )}

              {!query.trim() && (
                <div className="p-4">
                  <p className="text-xs text-ink/40 uppercase tracking-wider mb-2">Quick Search</p>
                  <p className="text-sm text-ink/60">
                    Start typing to search for wines, regions, or tasting notes.
                  </p>
                </div>
              )}
            </m.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
