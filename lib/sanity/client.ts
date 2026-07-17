import type { SanityImage } from "./types";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-06-09";

type SanityParams = Record<string, string | number | boolean | string[] | undefined>;

export function groq(strings: TemplateStringsArray, ...values: unknown[]) {
  return strings.reduce((query, string, index) => `${query}${string}${values[index] ?? ""}`, "");
}

export async function sanityFetch<T>({
  query,
  params = {},
}: {
  query: string;
  params?: SanityParams;
  revalidate?: number;
}): Promise<T> {
  if (!projectId) {
    // During build without env vars, return empty result
    console.warn("NEXT_PUBLIC_SANITY_PROJECT_ID not configured, returning empty data");
    return [] as T;
  }

  const url = new URL(`https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`);
  url.searchParams.set("query", query);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(`$${key}`, JSON.stringify(value));
    }
  }

  console.log(`[Sanity] Fetching from: ${url.toString()}`);

  const headers: HeadersInit = {};
  
  // Add token for authenticated server-side requests if available.
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { 
    next: { revalidate: 0 },
    cache: 'no-store',
    headers
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Sanity] Failed:`, response.status, errorText);
    throw new Error(`Sanity request failed: ${response.status}`);
  }

  const payload = (await response.json()) as { result: T };
  console.log(`[Sanity] Got ${Array.isArray(payload.result) ? payload.result.length : 'non-array'} results from dataset: ${dataset}`);
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
