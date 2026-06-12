import type { SanityImage } from "./types";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-06-09";

type SanityParams = Record<string, string | number | boolean | string[] | undefined>;

export function groq(strings: TemplateStringsArray, ...values: unknown[]) {
  return strings.reduce((query, string, index) => `${query}${string}${values[index] ?? ""}`, "");
}

export async function sanityFetch<T>({
  query,
  params = {},
  revalidate = 60,
}: {
  query: string;
  params?: SanityParams;
  revalidate?: number;
}): Promise<T> {
  if (!projectId) {
    throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID");
  }

  const url = new URL(`https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`);
  url.searchParams.set("query", query);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(`$${key}`, JSON.stringify(value));
    }
  }

  const response = await fetch(url, { next: { revalidate } });

  if (!response.ok) {
    throw new Error(`Sanity request failed: ${response.status}`);
  }

  const payload = (await response.json()) as { result: T };
  return payload.result;
}

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
