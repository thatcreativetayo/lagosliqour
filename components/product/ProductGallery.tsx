"use client";

import Image from "next/image";
import { useState } from "react";

export interface GalleryImage {
  src: string;
  alt: string;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  title: string;
  accentColor?: string;
}

export default function ProductGallery({ images, title, accentColor }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0];
  const bgStyle = accentColor ? { backgroundColor: accentColor } : {};

  return (
    <div className="flex flex-col gap-4">
      <div 
        className="relative aspect-square flex items-center justify-center overflow-hidden"
        style={bgStyle}
      >
        {activeImage ? (
          <Image
            src={activeImage.src}
            alt={activeImage.alt || title}
            fill
            priority
            className="object-contain p-6 sm:p-10"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {images.map((image, index) => (
            <button
              key={`${image.src}-${index}`}
              type="button"
              aria-label={`View ${title} image ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-square border transition-all duration-300 ${
                index === activeIndex ? "border-wine" : "border-wine/10"
              }`}
              style={bgStyle}
            >
              <Image
                src={image.src}
                alt={image.alt || title}
                fill
                className="object-contain p-3"
                sizes="120px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
