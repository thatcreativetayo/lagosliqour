"use client";

import { SignInButton, useUser } from "@clerk/nextjs";
import { m } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  ArrowRight,
  CheckCircle,
  CreditCard,
  SealCheck,
  ShieldCheck,
  ShoppingBag,
  Sparkle,
  Truck,
} from "@phosphor-icons/react";
import Hero from "./Hero";
import { urlFor } from "@/lib/sanity/client";
import type { WineCardResult, SanityCategory } from "@/lib/sanity/types";
import { useCartStore } from "@/lib/stores/cart";

interface PremiumLandingProps {
  products: WineCardResult[];
  categories?: SanityCategory[];
}

const ease = [0.25, 0.1, 0.25, 1] as const;
const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-90px" },
  transition: { duration: 0.72, ease },
};

const fallbackProducts: WineCardResult[] = [
  {
    _id: "fallback-casamigos-blanco",
    title: "Casamigos Blanco",
    slug: "casamigos-blanco",
    price: 58000,
    region: "Jalisco, Mexico",
    origin: "Jalisco, Mexico",
    vintage: 2026,
    bottleSize: "750ml",
    inStock: true,
    stockCount: 12,
    accentColor: "#F5F5F5",
    tastingNotes: ["Crisp agave", "Citrus", "Vanilla"],
    abv: "40%",
    age: "Unaged",
    image: { asset: { url: "/product1.png" }, alt: "Casamigos Blanco bottle" },
  },
  {
    _id: "fallback-don-julio-1942",
    title: "Don Julio 1942 Anejo",
    slug: "don-julio-1942-anejo",
    price: 165000,
    region: "Jalisco, Mexico",
    origin: "Jalisco, Mexico",
    vintage: 2026,
    bottleSize: "750ml",
    inStock: true,
    stockCount: 8,
    accentColor: "#B38B4D",
    tastingNotes: ["Caramel", "Oak", "Warm agave"],
    abv: "40%",
    age: "2+ years",
    image: { asset: { url: "/product1.png" }, alt: "Don Julio 1942 bottle" },
  },
];

function productImage(product: WineCardResult, width = 900) {
  const directUrl = product.image?.asset?.url;
  if (directUrl?.startsWith("/")) return directUrl;

  const src = urlFor(product.image).width(width).quality(90).url();
  return src || directUrl || "/hero.png";
}

function formatNaira(value: number) {
  return `NGN ${value.toLocaleString("en-NG")}`;
}

function withAlpha(hex = "#D8B25A", alpha = "26") {
  return `${hex}${alpha}`;
}

function SectionLine({ className = "" }: { className?: string }) {
  return <div className={`story-line h-px w-full origin-left bg-wine/20 ${className}`} />;
}

function ProductCard({ product, priority = false, dark = false }: { product: WineCardResult; priority?: boolean; dark?: boolean }) {
  const cart = useCartStore();
  const image = productImage(product, 700);
  const accent = product.accentColor ?? "#D8B25A";
  const notes = product.tastingNotes?.slice(0, 3) ?? [];

  function addToCart() {
    if (!product.inStock) return;
    cart.addItem({
      wineId: product._id,
      slug: product.slug,
      title: product.title,
      image,
      quantity: 1,
      unitPrice: product.price,
    });
  }

  return (
    <m.article
      {...fadeUp}
      className={`group flex min-h-[430px] flex-col justify-between border p-4 transition-colors duration-500 sm:p-5 ${
        dark ? "border-white/10 bg-white/[0.04] text-cream" : "border-wine/10 bg-[#F8F4EA] text-ink"
      }`}
      style={{ backgroundImage: `linear-gradient(145deg, ${withAlpha(accent, "28")}, transparent 52%)` }}
    >
      <Link href={`/wines/${product.slug}`} className="relative flex aspect-[4/5] items-center justify-center overflow-hidden">
        <div className="absolute inset-x-8 bottom-8 h-20 blur-3xl" style={{ backgroundColor: accent, opacity: 0.3 }} />
        <Image
          src={image}
          alt={product.image?.alt || product.title}
          width={520}
          height={720}
          priority={priority}
          className="relative z-10 h-full w-full object-contain p-4 transition-transform duration-700 group-hover:-translate-y-2 group-hover:scale-105"
        />
      </Link>

      <div className="mt-4 flex flex-col gap-4">
        <div>
          <div className={`mb-2 flex items-center justify-between gap-3 text-[11px] uppercase ${dark ? "text-cream/45" : "text-wine/55"}`}>
            <span>{product.bottleSize}</span>
            <span>{product.abv ?? "40%"}</span>
          </div>
          <Link href={`/wines/${product.slug}`}>
            <h3 className="font-serif text-2xl uppercase leading-tight">{product.title}</h3>
          </Link>
          <p className={`mt-2 text-sm ${dark ? "text-cream/55" : "text-ink/58"}`}>
            {notes.join(" / ") || product.origin || product.region}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className={`font-serif text-xl ${dark ? "text-gold" : "text-wine"}`}>{formatNaira(product.price)}</p>
          <button
            type="button"
            onClick={addToCart}
            disabled={!product.inStock}
            className={`inline-flex h-10 w-10 items-center justify-center border transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              dark ? "border-gold/50 text-gold hover:bg-gold hover:text-ink" : "border-wine/35 text-wine hover:bg-wine hover:text-cream"
            }`}
            aria-label={`Add ${product.title} to cart`}
            title={`Add ${product.title} to cart`}
          >
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>
    </m.article>
  );
}

export default function PremiumLanding({ products, categories = [] }: PremiumLandingProps) {
  const collection = products.length ? products : fallbackProducts;
  const heroProduct = collection.find((product) => product.title.toLowerCase().includes("1942")) ?? collection[0];
  const casamigos = collection.filter((product) => product.title.toLowerCase().includes("casamigos"));
  const { isSignedIn } = useUser();
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      gsap.fromTo(".hero-bottle", { y: 40, rotate: -18 }, {
        y: -80,
        rotate: -31,
        ease: "none",
        scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: true },
      });

      gsap.utils.toArray<HTMLElement>(".story-line").forEach((line) => {
        gsap.fromTo(line, { scaleX: 0 }, {
          scaleX: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: line, start: "top 82%" },
        });
      });

      gsap.utils.toArray<HTMLElement>(".story-step").forEach((step) => {
        gsap.fromTo(step, { opacity: 0.35, y: 40 }, {
          opacity: 1,
          y: 0,
          ease: "power2.out",
          scrollTrigger: { trigger: step, start: "top 78%", end: "top 42%", scrub: true },
        });
      });

      gsap.to(".horizontal-gallery", {
        xPercent: -22,
        ease: "none",
        scrollTrigger: { trigger: ".gallery-section", start: "top bottom", end: "bottom top", scrub: true },
      });
    }, rootRef);

    return () => context.revert();
  }, []);

  return (
    <main ref={rootRef} className="bg-cream text-ink">
      <Hero />

      {/* Trust Badges & Delivery Info */}
      <section className="bg-cream border-y border-wine/10 py-6 sm:py-8">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: Truck, title: "Free Delivery", desc: "Across Lagos" },
              { icon: ShieldCheck, title: "Verified", desc: "100% Authentic" },
              { icon: CreditCard, title: "Secure", desc: "Safe Payment" },
              { icon: CheckCircle, title: "Fast Dispatch", desc: "24/7 Service" },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3">
                <item.icon size={24} className="text-wine flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-ink">{item.title}</p>
                  <p className="text-xs text-ink/60">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Quick Links */}
      {categories.length > 0 && (
        <section className="py-10 sm:py-12 lg:py-16 bg-cream">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16">
            <m.div {...fadeUp} className="mb-6 sm:mb-8">
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl uppercase text-ink">Shop by Category</h2>
              <p className="mt-2 text-sm text-ink/60">Find your perfect drink</p>
            </m.div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {categories.map((category, index) => (
                <m.div
                  key={category._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                  <Link
                    href={`/shop?category=${category.slug}`}
                    className="group flex flex-col items-center gap-3 p-4 border border-wine/10 hover:border-wine/30 hover:bg-wine/5 transition-all duration-300 rounded-sm"
                  >
                    <div className="w-16 h-16 bg-wine/10 rounded-full flex items-center justify-center group-hover:bg-wine/20 transition-colors">
                      <Sparkle size={24} className="text-wine" />
                    </div>
                    <p className="text-center text-sm font-medium text-ink group-hover:text-wine transition-colors">
                      {category.title}
                    </p>
                  </Link>
                </m.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="border-y border-wine/15 bg-[#F8F4EA] py-4 sm:py-5 overflow-hidden">
        <div className="mx-auto flex max-w-[1400px] gap-6 sm:gap-8 px-4 sm:px-6 lg:px-16 text-xs sm:text-sm uppercase text-wine/58 overflow-x-auto scrollbar-hide">
          {["Casamigos Blanco", "Casamigos Reposado", "Casamigos Anejo", "Casamigos Cristalino", "Don Julio 1942", "Authentic Lagos delivery"].map((item) => (
            <span key={item} className="shrink-0">{item}</span>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-16 py-12 sm:py-16 lg:py-20">
        <m.div {...fadeUp} className="grid gap-6 sm:gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="mb-3 sm:mb-4 text-xs uppercase tracking-[0.22em] text-wine/65">01 / Lagos Liqour Reserve</p>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-7xl uppercase leading-none text-ink">Premium bottles, edited like a private cellar.</h2>
          </div>
          <p className="max-w-xl text-base sm:text-lg leading-7 sm:leading-8 text-ink/62">
            The inspiration is classic luxury: a single bottle as the hero, confident whitespace, editorial lines, and a slow reveal of craft, service, and provenance.
          </p>
        </m.div>
        <SectionLine className="mt-8 sm:mt-12" />
      </section>

      <section className="bg-[#140B0C] py-12 sm:py-16 lg:py-20 text-cream">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-8 sm:gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-16">
          <m.div {...fadeUp} className="lg:sticky lg:top-28 lg:self-start">
            <p className="mb-3 sm:mb-4 text-xs uppercase tracking-[0.22em] text-gold">02 / Featured Pour</p>
            <h2 className="font-serif text-4xl sm:text-6xl lg:text-8xl uppercase leading-none">{heroProduct?.title}</h2>
            <p className="mt-4 sm:mt-6 max-w-md text-sm sm:text-base text-cream/58">{heroProduct?.tastingNotes?.join(" / ") || "Golden agave, soft oak, and a polished finish."}</p>
          </m.div>
          <div className="relative flex min-h-[400px] sm:min-h-[520px] lg:min-h-[620px] items-center justify-center">
            <div className="absolute h-[54%] w-[54%] rounded-full blur-3xl" style={{ backgroundColor: withAlpha(heroProduct?.accentColor ?? "#D8B25A", "55") }} />
            {heroProduct ? (
              <Image src={productImage(heroProduct, 1100)} alt={heroProduct.title} width={760} height={960} className="relative z-10 max-h-[400px] sm:max-h-[520px] lg:max-h-[620px] object-contain" />
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-16 py-12 sm:py-16 lg:py-20">
        <m.div {...fadeUp} className="mb-8 sm:mb-12 flex flex-col sm:flex-row justify-between gap-4 sm:gap-6 sm:items-end">
          <div>
            <p className="mb-3 sm:mb-4 text-xs uppercase tracking-[0.22em] text-wine/65">03 / Tequila Collection</p>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl uppercase leading-none">The Casamigos Line</h2>
          </div>
          <Link href="/shop" className="inline-flex items-center gap-2 sm:gap-3 text-sm uppercase text-wine self-start sm:self-auto">
            Shop all <ArrowRight size={16} />
          </Link>
        </m.div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {(casamigos.length ? casamigos : collection).slice(0, 4).map((product, index) => (
            <ProductCard key={product._id} product={product} priority={index < 2} />
          ))}
        </div>
      </section>

      <section className="bg-[#F8F4EA] py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-16">
          <m.div {...fadeUp}>
            <p className="mb-3 sm:mb-4 text-xs uppercase tracking-[0.22em] text-wine/65">04 / Story Scroll</p>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-7xl uppercase leading-none">From agave to arrival.</h2>
          </m.div>
          <div className="mt-10 sm:mt-14 grid gap-6 sm:gap-8 lg:grid-cols-3">
            {[
              ["Jalisco", "Ultra-premium tequila begins with Blue Weber agave from Mexico's most recognized tequila region."],
              ["Cellar", "Bottles are selected for Lagos tables where packaging, pour, and provenance all matter."],
              ["Dispatch", "Orders move through the existing cart, Supabase order record, and Credo checkout path."],
            ].map(([title, body]) => (
              <div key={title} className="story-step border-l border-wine/25 pl-5 sm:pl-6">
                <p className="font-serif text-2xl sm:text-3xl lg:text-4xl uppercase text-wine">{title}</p>
                <p className="mt-3 sm:mt-4 leading-6 sm:leading-7 text-sm sm:text-base text-ink/62">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F8F4EA] py-12 sm:py-16 lg:py-20">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-8 sm:gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-16">
          <m.div {...fadeUp}>
            <p className="mb-3 sm:mb-4 text-xs uppercase tracking-[0.22em] text-wine/65">05 / Service</p>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl uppercase leading-none">Luxury without friction.</h2>
          </m.div>
          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "Verified", body: "Supplier checks and product records before the bottle reaches the shelf." },
              { icon: Truck, title: "Lagos Fast", body: "Island, Mainland, and event drops with practical dispatch windows." },
              { icon: CreditCard, title: "Secure NGN", body: "Secure checkout uses the existing payment route." },
            ].map((item) => (
              <m.div key={item.title} {...fadeUp} className="border border-wine/12 bg-cream p-4 sm:p-5">
                <item.icon size={22} className="text-wine sm:size-[25px]" />
                <h3 className="mt-4 sm:mt-6 font-serif text-xl sm:text-2xl uppercase">{item.title}</h3>
                <p className="mt-2 sm:mt-3 text-xs sm:text-sm leading-5 sm:leading-6 text-ink/62">{item.body}</p>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-16 py-12 sm:py-16 lg:py-20">
        <m.div {...fadeUp} className="grid gap-6 sm:gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div className="relative min-h-[300px] sm:min-h-[400px] lg:min-h-[460px] overflow-hidden bg-[#F8F4EA]">
            {collection.slice(0, 3).map((product, index) => (
              <Image
                key={product._id}
                src={productImage(product, 800)}
                alt={product.title}
                width={420}
                height={620}
                className="absolute bottom-0 object-contain"
                style={{ left: `${12 + index * 25}%`, height: `${82 - index * 8}%`, width: "auto" }}
              />
            ))}
          </div>
          <div>
            <p className="mb-3 sm:mb-4 text-xs uppercase tracking-[0.22em] text-wine/65">06 / Occasion</p>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl uppercase leading-none">For private dinners, gifting, and late-night tables.</h2>
            <p className="mt-4 sm:mt-6 max-w-lg leading-6 sm:leading-7 text-sm sm:text-base text-ink/62">
              The experience borrows from luxury packaging houses: the bottle is treated like a collectible object, then paired with fast commerce.
            </p>
          </div>
        </m.div>
      </section>

      <section className="gallery-section overflow-hidden bg-[#F8F4EA] py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-16">
          <m.div {...fadeUp} className="mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
            <div>
              <p className="mb-3 sm:mb-4 text-xs uppercase tracking-[0.22em] text-wine/65">08 / Gallery</p>
              <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl uppercase">Bottle studies.</h2>
            </div>
            <Sparkle size={24} className="text-wine sm:size-[30px]" />
          </m.div>
          <div className="horizontal-gallery flex w-max gap-4 sm:gap-5 pb-3 sm:pb-4">
            {collection.concat(collection).slice(0, 8).map((product, index) => (
              <Link
                key={`${product._id}-${index}`}
                href={`/wines/${product.slug}`}
                className="relative flex aspect-[3/4] w-[200px] sm:w-[250px] lg:w-[320px] shrink-0 items-center justify-center overflow-hidden border border-wine/10 bg-cream"
                style={{ backgroundImage: `linear-gradient(160deg, ${withAlpha(product.accentColor ?? "#D8B25A", "30")}, transparent)` }}
              >
                <Image src={productImage(product, 700)} alt={product.title} fill className="object-contain p-6 sm:p-8" sizes="320px" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-wine py-12 sm:py-16 lg:py-20 text-cream">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-5 sm:gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-16">
          {[
            ["The Don Julio 1942 arrived chilled, sealed, and exactly on time for a private dinner in Ikoyi.", "Tola A."],
            ["Finally, a premium spirits store in Lagos that treats tequila like luxury, not an afterthought.", "Nneka O."],
            ["Quick checkout, clear delivery updates, and the bottles looked immaculate on the bar.", "Femi B."],
          ].map(([quote, name]) => (
            <m.figure key={name} {...fadeUp} className="border border-cream/15 p-5 sm:p-6">
              <blockquote className="text-base sm:text-lg leading-7 sm:leading-8 text-cream/80">&quot;{quote}&quot;</blockquote>
              <figcaption className="mt-4 sm:mt-6 text-sm uppercase text-gold">{name}</figcaption>
            </m.figure>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-8 sm:gap-10 px-4 sm:px-6 py-12 sm:py-16 lg:py-20 lg:grid-cols-[1fr_auto] lg:px-16">
        <div>
          <p className="mb-3 sm:mb-4 text-xs uppercase tracking-[0.22em] text-wine/65">10 / Private Client Access</p>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl uppercase leading-none">Save orders. Refill faster. Pay securely.</h2>
          <p className="mt-4 sm:mt-5 max-w-2xl text-sm sm:text-base text-ink/62">
            Powers sign-in and order history, stores orders, and completes NGN checkout through the existing flow.
          </p>
          <div className="mt-5 sm:mt-6 flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-wine">
            <span className="inline-flex items-center gap-1.5 sm:gap-2"><SealCheck size={15} className="sm:size-[17px]" /> Authenticity checks</span>
            <span className="inline-flex items-center gap-1.5 sm:gap-2"><CheckCircle size={15} className="sm:size-[17px]" /> Same cart flow</span>
          </div>
        </div>
        {isSignedIn ? (
          <Link href="/orders" className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-wine px-5 sm:px-6 py-2.5 sm:py-3 text-sm uppercase text-cream hover:bg-ink w-full sm:w-auto">
            View Orders <ArrowRight size={17} />
          </Link>
        ) : (
          <SignInButton mode="modal">
            <button className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-wine px-5 sm:px-6 py-2.5 sm:py-3 text-sm uppercase text-cream hover:bg-ink w-full sm:w-auto">
              Sign In <ArrowRight size={17} />
            </button>
          </SignInButton>
        )}
      </section>
    </main>
  );
}
