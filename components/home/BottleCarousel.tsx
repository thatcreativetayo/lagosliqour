"use client";

import { m, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { WINES } from "@/lib/data/wines";
import Button from "@/components/ui/Button";

type PositionKey = "-2" | "-1" | "0" | "1" | "2";

interface BottlePosition {
  x: number;
  z: number;
  scale: number;
  opacity: number;
  zIndex: number;
  brightness: number;
}

const POSITIONS: Record<PositionKey, BottlePosition> = {
  "0": { x: 0, z: 160, scale: 1, opacity: 1, zIndex: 10, brightness: 1 },
  "1": { x: 220, z: 20, scale: 0.7, opacity: 0.82, zIndex: 8, brightness: 0.7 },
  "-1": { x: -220, z: 20, scale: 0.7, opacity: 0.82, zIndex: 8, brightness: 0.7 },
  "2": { x: 370, z: -50, scale: 0.5, opacity: 0.5, zIndex: 6, brightness: 0.48 },
  "-2": { x: -370, z: -50, scale: 0.5, opacity: 0.5, zIndex: 6, brightness: 0.48 },
};

const MOBILE_POSITIONS: Record<PositionKey, BottlePosition> = {
  "0": { x: 0, z: 160, scale: 1, opacity: 1, zIndex: 10, brightness: 1 },
  "1": { x: 130, z: 20, scale: 0.7, opacity: 0.82, zIndex: 8, brightness: 0.7 },
  "-1": { x: -130, z: 20, scale: 0.7, opacity: 0.82, zIndex: 8, brightness: 0.7 },
  "2": { x: 220, z: -50, scale: 0.5, opacity: 0, zIndex: 6, brightness: 0.48 },
  "-2": { x: -220, z: -50, scale: 0.5, opacity: 0, zIndex: 6, brightness: 0.48 },
};

const TABLET_POSITIONS: Record<PositionKey, BottlePosition> = {
  "0": { x: 0, z: 160, scale: 1, opacity: 1, zIndex: 10, brightness: 1 },
  "1": { x: 170, z: 20, scale: 0.7, opacity: 0.82, zIndex: 8, brightness: 0.7 },
  "-1": { x: -170, z: 20, scale: 0.7, opacity: 0.82, zIndex: 8, brightness: 0.7 },
  "2": { x: 290, z: -50, scale: 0.5, opacity: 0.5, zIndex: 6, brightness: 0.48 },
  "-2": { x: -290, z: -50, scale: 0.5, opacity: 0.5, zIndex: 6, brightness: 0.48 },
};

function getDiff(index: number, active: number, total: number): number {
  let diff = index - active;
  if (diff > total / 2) diff -= total;
  if (diff < -total / 2) diff += total;
  return diff;
}

function useBreakpoint() {
  const [bp, setBp] = useState<"mobile" | "tablet" | "desktop">("desktop");

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setBp("mobile");
      else if (w < 1024) setBp("tablet");
      else setBp("desktop");
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return bp;
}

export default function BottleCarousel() {
  const wines = useMemo(() => WINES.filter((w) => w.featured), []);
  const [active, setActive] = useState(0);
  const bp = useBreakpoint();

  const positions =
    bp === "mobile"
      ? MOBILE_POSITIONS
      : bp === "tablet"
        ? TABLET_POSITIONS
        : POSITIONS;

  const bottleWidth = bp === "mobile" ? 90 : bp === "tablet" ? 110 : 130;

  const wine = wines[active];

  const go = useCallback(
    (dir: -1 | 1) => {
      setActive((i) => (i + dir + wines.length) % wines.length);
    },
    [wines.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return (
    <section className="bg-ink relative overflow-hidden py-16 sm:py-20 lg:py-24">
      <div
        className="absolute inset-0 pointer-events-none transition-[background] duration-[900ms] ease-in-out"
        style={{
          background: `radial-gradient(ellipse at 50% 42%, rgba(${wine.glow}, 0.22) 0%, transparent 62%)`,
        }}
      />

      <div className="relative max-w-[1400px] mx-auto px-6">
        <div
          className="relative mx-auto"
          style={{
            perspective: "1400px",
            perspectiveOrigin: "50% 50%",
            height: bp === "mobile" ? 380 : 520,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {wines.map((w, index) => {
            const diff = getDiff(index, active, wines.length);
            const key = String(Math.max(-2, Math.min(2, diff))) as PositionKey;
            const pos = positions[key];
            const isActive = diff === 0;
            const hiddenFar = bp === "mobile" && Math.abs(diff) >= 2;

            return (
              <div
                key={w.id}
                className="absolute"
                style={{
                  transform: `translateX(${pos.x}px) translateZ(${pos.z}px) scale(${pos.scale})`,
                  opacity: hiddenFar ? 0 : pos.opacity,
                  zIndex: pos.zIndex,
                  filter: `brightness(${pos.brightness})`,
                  transition:
                    "transform 0.65s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.65s ease, filter 0.65s ease",
                  pointerEvents: hiddenFar ? "none" : "auto",
                  transformStyle: "preserve-3d",
                }}
              >
                <div className={isActive ? "animate-float" : ""}>
                  <Image
                    src={w.image}
                    alt={w.name}
                    width={bottleWidth}
                    height={bottleWidth * 3}
                    className="object-contain h-auto"
                    style={{
                      width: bottleWidth,
                      filter: "drop-shadow(0 40px 60px rgba(0,0,0,0.7))",
                    }}
                    priority={isActive}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-6 mt-6">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous wine"
            className="w-[38px] h-[38px] flex items-center justify-center border border-[var(--border)] text-cream/80 hover:border-gold hover:text-gold transition-colors duration-300"
          >
            <CaretLeft size={18} weight="thin" />
          </button>

          <div className="flex items-center gap-2">
            {wines.map((w, i) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Go to ${w.name}`}
                className="h-[5px] rounded-full transition-all duration-500 ease-out"
                style={{
                  width: i === active ? 28 : 5,
                  backgroundColor: w.accent,
                  opacity: i === active ? 1 : 0.45,
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next wine"
            className="w-[38px] h-[38px] flex items-center justify-center border border-[var(--border)] text-cream/80 hover:border-gold hover:text-gold transition-colors duration-300"
          >
            <CaretRight size={18} weight="thin" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <m.div
            key={wine.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="max-w-[640px] mx-auto text-center mt-12 sm:mt-16 px-4"
          >
            <p className="text-eyebrow text-gold/80 mb-4">{wine.note}</p>
            <h2 className="font-display text-heading-2 italic text-cream mb-5">
              &ldquo;{wine.tagline}&rdquo;
            </h2>
            <p className="text-body text-cream/60 mb-8">{wine.description || wine.title}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
              <span className="text-price text-cream">
                ₦{(wine.price || 0).toLocaleString()}
              </span>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button href="/shop" variant="ghost" className="!text-cream !border-cream/20">
                  View Details
                </Button>
                <Button href="/shop" variant="gold">
                  Order Now
                </Button>
              </div>
            </div>
          </m.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
