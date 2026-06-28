"use client";

import { m, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ShoppingCart01Icon,
  FavouriteIcon,
  UserIcon,
  Logout01Icon,
} from "@hugeicons/core-free-icons";
import Image from "next/image";
import { useCartStore } from "@/lib/stores/cart";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { getCategories, getAllWinesForSearch } from "@/lib/sanity/queries";
import SearchBar from "@/components/ui/SearchBar";
import type { SanityCategory, WineCardResult } from "@/lib/sanity/types";

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function Logo() {
  return (
    <Link href="/" className="flex flex-col items-center gap-1.5 group">
      <Image
        src="/logo.svg"
        alt="Logo"
        width={1000}
        height={1000}
        className="w-14 sm:w-16 lg:w-20 h-auto filter drop-shadow-sm"
        style={{ filter: 'contrast(1.1) brightness(1.05)' }}
      />
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState<SanityCategory[]>([]);
  const [wines, setWines] = useState<WineCardResult[]>([]);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const { scrollY } = useScroll();
  const cart = useCartStore();
  const { isSignedIn } = useUser();

  useEffect(() => {
    getCategories().then(setCategories);
    getAllWinesForSearch().then(setWines);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 60);
  });

  const showSolid = scrolled || !isHome;

  const iconClass = "text-ink hover:text-wine transititon-all duration-300 size-4 sm:size-5";

  return (
    <m.header
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
        showSolid
          ? "bg-cream backdrop-blur-sm border-b border-wine/10"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16 h-[64px] sm:h-[72px]">
        <div className="flex items-center justify-between h-full gap-3">
          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-ink p-2 -ml-2"
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>

          {/* Logo - Desktop */}
          <div className="hidden lg:block">
            <Logo />
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex gap-6 sm:gap-8 items-center">
            <Link
              href="/shop"
              className={`text-sm text-ink hover:text-wine transition-colors ${
                pathname === "/shop" ? "text-wine" : ""
              }`}
            >
              Shop
            </Link>

            {/* Categories Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className={`text-sm text-ink hover:text-wine transition-colors flex items-center gap-1 ${
                  pathname.startsWith("/shop?category=") ? "text-wine" : ""
                }`}
              >
                Categories
                <svg
                  className={`w-3 h-3 transition-transform duration-200 ${categoriesOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {categoriesOpen && categories.length > 0 && (
                  <m.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-48 bg-cream border border-wine/10 shadow-lg rounded-sm overflow-hidden z-50"
                  >
                    {categories.map((category) => (
                      <Link
                        key={category._id}
                        href={`/shop?category=${category.slug}`}
                        onClick={() => setCategoriesOpen(false)}
                        className="block px-4 py-2.5 text-ink hover:bg-wine/5 hover:text-wine transition-colors text-sm"
                      >
                        {category.title}
                      </Link>
                    ))}
                  </m.div>
                )}
              </AnimatePresence>
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm text-ink hover:text-wine transition-colors ${
                  pathname === link.href ? "text-wine" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search Bar - Responsive */}
          <div className="flex-1 flex justify-center lg:justify-start max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[350px] xl:max-w-[400px]">
            <SearchBar wines={wines} />
          </div>

          {/* Logo - Mobile */}
          <div className="lg:hidden flex-shrink-0">
            <Logo />
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <Link href="/cart" aria-label="Cart" className="relative">
              <HugeiconsIcon icon={ShoppingCart01Icon} className={iconClass} />
              {cart.count > 0 ? (
                <span className="absolute -top-1 -right-1 bg-wine text-cream text-[10px] sm:text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-sans">
                  {cart.count}
                </span>
              ) : null}
            </Link>

            <Link href="/liked" aria-label="Wishlist" className="hidden sm:block">
              <HugeiconsIcon icon={FavouriteIcon} className={iconClass} />
            </Link>

            {isSignedIn ? (
              <>
                <Link href="/orders" aria-label="My Orders" className="hidden sm:block">
                  <HugeiconsIcon icon={UserIcon} className={iconClass} />
                </Link>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-7 h-7 sm:w-8 sm:h-8",
                    },
                  }}
                />
              </>
            ) : (
              <div className="hidden sm:flex gap-2 items-center">
                <SignInButton mode="modal">
                  <button className="text-ink font-sans hover:text-wine transition-colors text-sm">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-wine font-sans text-cream px-3 py-1.5 sm:px-4 sm:py-2 text-sm hover:bg-transparent hover:text-wine border-2 border-wine transition-all duration-300">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <m.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-cream border-t border-wine/10 overflow-y-auto max-h-[85vh] z-50 relative"
            >
            <div className="px-4 py-4 space-y-3">
              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 text-ink hover:text-wine transition-colors ${
                  pathname === "/shop" ? "text-wine font-medium" : ""
                }`}
              >
                Shop
              </Link>

              {/* Mobile Categories */}
              <div>
                <button
                  type="button"
                  onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                  className="flex items-center justify-between w-full py-2 text-ink hover:text-wine transition-colors"
                >
                  <span>Categories</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${mobileCategoriesOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <AnimatePresence>
                  {mobileCategoriesOpen && categories.length > 0 && (
                    <m.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="pl-4 space-y-2 mt-2 overflow-hidden"
                    >
                      {categories.map((category) => (
                        <Link
                          key={category._id}
                          href={`/shop?category=${category.slug}`}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setMobileCategoriesOpen(false);
                          }}
                          className="block py-1.5 text-ink/80 hover:text-wine transition-colors text-sm"
                        >
                          {category.title}
                        </Link>
                      ))}
                    </m.div>
                  )}
                </AnimatePresence>
              </div>

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2 text-ink hover:text-wine transition-colors ${
                    pathname === link.href ? "text-wine font-medium" : ""
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/liked"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-ink hover:text-wine transition-colors sm:hidden"
              >
                Liked Wines
              </Link>
              {isSignedIn ? (
                <Link
                  href="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-ink hover:text-wine transition-colors sm:hidden"
                >
                  My Orders
                </Link>
              ) : (
                <div className="flex flex-col gap-2 pt-2 sm:hidden">
                  <SignInButton mode="modal">
                    <button className="text-ink font-sans hover:text-wine transition-colors text-sm text-left py-2">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="bg-wine font-sans text-cream px-4 py-2 text-sm hover:bg-transparent hover:text-wine border-2 border-wine transition-all duration-300 text-center">
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </m.header>
  );
}
