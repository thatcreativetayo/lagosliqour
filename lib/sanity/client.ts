export { urlFor } from "./image";

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
  revalidate,
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

  // Honor the caller's revalidate window when provided; otherwise stay fresh.
  const fetchOptions: RequestInit & { next?: { revalidate: number } } =
    typeof revalidate === "number"
      ? { next: { revalidate }, headers }
      : { next: { revalidate: 0 }, cache: "no-store", headers };

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Sanity] Failed:`, response.status, errorText);
    throw new Error(`Sanity request failed: ${response.status}`);
  }

  const payload = (await response.json()) as { result: T };
  console.log(`[Sanity] Got ${Array.isArray(payload.result) ? payload.result.length : 'non-array'} results from dataset: ${dataset}`);
  return payload.result;
}
