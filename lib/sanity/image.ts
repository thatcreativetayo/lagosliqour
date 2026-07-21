import type { SanityImage } from "./types";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

function parseImageRef(ref?: string) {
  if (!ref) return null;
  const [, id, dimensions, format] = ref.match(/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/) ?? [];
  if (!id || !dimensions || !format) return null;
  return `${id}-${dimensions}.${format}`;
}

export function urlFor(source?: SanityImage | string) {
  const ref = typeof source === "string" ? source : source?.asset?._ref;
  const directUrl = typeof source === "string" && source.startsWith("http") ? source : typeof source === "string" ? undefined : source?.asset?.url;
  const fileName = parseImageRef(ref);
  const baseUrl = directUrl ?? (projectId && fileName ? `https://cdn.sanity.io/images/${projectId}/${dataset}/${fileName}` : "");

  return {
    width(width: number) {
      if (!baseUrl) return this;
      const nextUrl = new URL(baseUrl);
      nextUrl.searchParams.set("w", String(width));
      return urlFor(nextUrl.toString());
    },
    height(height: number) {
      if (!baseUrl) return this;
      const nextUrl = new URL(baseUrl);
      nextUrl.searchParams.set("h", String(height));
      return urlFor(nextUrl.toString());
    },
    quality(quality: number) {
      if (!baseUrl) return this;
      const nextUrl = new URL(baseUrl);
      nextUrl.searchParams.set("q", String(quality));
      return urlFor(nextUrl.toString());
    },
    url() {
      return baseUrl;
    },
  };
}
