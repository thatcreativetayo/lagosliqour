import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import ProductActions from "@/components/product/ProductActions";
import ProductGallery, { type GalleryImage } from "@/components/product/ProductGallery";
import LikeButton from "@/components/ui/LikeButton";
import Tag from "@/components/ui/Tag";
import ProductCard from "@/components/ui/ProductCard";
import StructuredData, { productData, breadcrumbData } from "@/components/seo/StructuredData";
import { urlFor } from "@/lib/sanity/client";
import { getAllWines, getWineBySlug, getCategories } from "@/lib/sanity/queries";
import type { SanityImage, WineDetailResult } from "@/lib/sanity/types";

interface WinePageProps {
  params: Promise<{ slug: string }>;
}

function imageUrl(image?: SanityImage, width = 1200) {
  return urlFor(image).width(width).quality(85).url();
}

function galleryImages(wine: WineDetailResult): GalleryImage[] {
  const images = wine.images
    ? wine.images
        .map((image) => ({
          src: imageUrl(image, 1200),
          alt: image.alt || wine.title,
        }))
        .filter((image) => image.src)
    : [];

  return images.length
    ? images
    : [{ src: "/product1.png", alt: wine.title }];
}

function Rating({ value = 0 }: { value?: number }) {
  const rounded = Math.round(value);

  return (
    <div className="flex items-center gap-2" aria-label={`${value || 0} out of 5 rating`}>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, index) => (
          <HugeiconsIcon
            key={index}
            icon={StarIcon}
            className={index < rounded ? "size-4 text-gold" : "size-4 text-wine/20"}
            fill={index < rounded ? "currentColor" : "none"}
            strokeWidth={1.8}
          />
        ))}
      </div>
      <span className="text-xs text-ink/60">{value ? value.toFixed(1) : "Unrated"}</span>
    </div>
  );
}

export async function generateMetadata({ params }: WinePageProps): Promise<Metadata> {
  const { slug } = await params;
  const wine = await getWineBySlug(slug);

  if (!wine) {
    return {
      title: "Wine not found | Lagos Liquor",
    };
  }

  const ogImage = imageUrl(wine.images[0], 1200);
  const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://lagosliquor.com"}/wines/${wine.slug}`;

  return {
    title: `${wine.title} | Lagos Liquor`,
    description: wine.description,
    keywords: [
      wine.title,
      wine.region,
      wine.category?.title,
      wine.grapeVariety,
      "wine Nigeria",
      "premium wine",
      wine.tastingNotes?.join(", "),
    ].filter(Boolean).join(", "),
    openGraph: {
      title: `${wine.title} | Lagos Liquor`,
      description: wine.description,
      url: productUrl,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: wine.images[0]?.alt || wine.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${wine.title} | Lagos Liquor`,
      description: wine.description,
      images: ogImage ? [ogImage] : [],
    },
    alternates: {
      canonical: productUrl,
    },
  };
}

export default async function WinePage({ params }: WinePageProps) {
  const { slug } = await params;
  const wine = await getWineBySlug(slug);

  if (!wine) notFound();

  const images = galleryImages(wine);
  const related = wine.category?.slug
    ? (await getAllWines(wine.category.slug)).filter((item) => item._id !== wine._id).slice(0, 5)
    : [];
  const status = wine.inStock ? `${wine.stockCount ?? 0} in stock` : "Out of stock";
  const bgColor = wine.accentColor ? `${wine.accentColor}15` : "rgb(109 27 26 / 0.05)";

  const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://lagosliquor.com"}/wines/${wine.slug}`;

  const structuredData = productData({
    title: wine.title,
    description: wine.description,
    price: wine.price,
    image: images[0]?.src || "",
    inStock: wine.inStock,
  });

  const breadcrumbSchema = breadcrumbData([
    { name: "Home", url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://lagosliquor.com"}/` },
    { name: "Shop", url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://lagosliquor.com"}/shop` },
    { name: wine.category?.title || "Wines", url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://lagosliquor.com"}/shop?category=${wine.category?.slug}` },
    { name: wine.title, url: productUrl },
  ]);

  return (
    <>
      <StructuredData data={structuredData} />
      <StructuredData data={breadcrumbSchema} />
      <main className="bg-cream pt-20 sm:pt-24 pb-12 sm:pb-20">
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-16 items-start">
          <div className="lg:col-span-7">
            <ProductGallery images={images} title={wine.title} accentColor={bgColor} />
          </div>

          <aside className="lg:col-span-5 flex flex-col gap-6 sm:gap-8">
            <div className="flex items-start justify-between gap-4 sm:gap-5">
              <div className="flex flex-col gap-2 sm:gap-3">
                {wine.category?.title ? <Tag>{wine.category.title}</Tag> : null}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-ink uppercase leading-tight">
                  {wine.title}
                </h1>
                <p className="text-sm sm:text-body text-ink/60">
                  {wine.vintage} · {wine.region} · {wine.grapeVariety}
                </p>
              </div>
              <LikeButton wineId={wine._id} className="shrink-0" />
            </div>

            <div className="flex flex-col gap-3 sm:gap-4 border-y border-wine/10 py-4 sm:py-6">
              <div className="flex items-end gap-3 sm:gap-4">
                <p className="text-wine text-3xl sm:text-4xl font-semibold">
                  ₦{wine.price.toLocaleString()}
                </p>
                {wine.comparePrice ? (
                  <p className="text-xl sm:text-2xl text-ink/40 line-through">
                    ₦{wine.comparePrice.toLocaleString()}
                  </p>
                ) : null}
              </div>
              <Rating value={wine.rating} />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-wine/5 p-3 sm:p-4">
                <p className="text-xs uppercase text-wine/70">Stock</p>
                <p className="text-dark mt-1.5 sm:mt-2 text-sm sm:text-base">{status}</p>
              </div>
              <div className="bg-wine/5 p-3 sm:p-4">
                <p className="text-xs uppercase text-wine/70">Bottle</p>
                <p className="text-dark mt-1.5 sm:mt-2 text-sm sm:text-base">{wine.bottleSize}</p>
              </div>
              <div className="bg-wine/5 p-3 sm:p-4">
                <p className="text-xs uppercase text-wine/70">Alcohol</p>
                <p className="text-dark mt-1.5 sm:mt-2 text-sm sm:text-base">{wine.alcoholContent}</p>
              </div>
              <div className="bg-wine/5 p-3 sm:p-4">
                <p className="text-xs uppercase text-wine/70">Vintage</p>
                <p className="text-dark mt-1.5 sm:mt-2 text-sm sm:text-base">{wine.vintage}</p>
              </div>
            </div>

            {wine.tastingNotes.length ? (
              <div>
                <p className="text-xs uppercase text-wine/70 mb-2 sm:mb-3">Tasting notes</p>
                <div className="flex flex-wrap gap-2">
                  {wine.tastingNotes.map((note) => (
                    <span key={note} className="border border-wine/20 text-wine px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs uppercase">
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {wine.pairings.length ? (
              <div>
                <p className="text-xs uppercase text-wine/70 mb-2 sm:mb-3">Food pairings</p>
                <div className="flex flex-wrap gap-2">
                  {wine.pairings.map((pairing) => (
                    <span key={pairing} className="bg-wine/5 text-dark px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs uppercase">
                      {pairing}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <ProductActions
              wine={{
                wineId: wine._id,
                slug: wine.slug,
                title: wine.title,
                image: images[0]?.src,
                price: wine.price,
                inStock: wine.inStock,
                stockCount: wine.stockCount,
              }}
            />
          </aside>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16 mt-12 sm:mt-16 lg:mt-20">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-wider text-wine mb-3 sm:mb-4">Description</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-ink uppercase mb-4 sm:mb-6">
            Cellar Notes
          </h2>
          <p className="text-sm sm:text-body text-ink/70 leading-relaxed">{wine.description}</p>
        </div>
      </section>

      {related.length ? (
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16 mt-12 sm:mt-16 lg:mt-20">
          <div className="mb-8 sm:mb-12 lg:mb-16">
            <p className="text-xs uppercase tracking-wider text-wine mb-3 sm:mb-4">You might also like</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-ink uppercase">
              Same Cellar
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 lg:gap-8">
            {related.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
    </>
  );
}
