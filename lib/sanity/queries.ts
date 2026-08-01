import { groq, sanityFetch } from "./client";
import type {
  SanityCategory,
  SiteSettingsResult,
  WineCardResult,
  WineDetailResult,
} from "./types";

const categoryFields = groq`
  _id,
  title,
  "slug": slug.current,
  description,
  image
`;

const wineCardFields = groq`
  _id,
  title,
  name,
  "slug": slug.current,
  price,
  comparePrice,
  region,
  origin,
  vintage,
  bottleSize,
  inStock,
  stock,
  rating,
  featured,
  accentColor,
  tastingNotes,
  abv,
  age,
  variants,
  bottleImage,
  "stockCount": coalesce(stockCount, stock),
  "image": coalesce(bottleImage, images[0]),
  "category": category->{${categoryFields}}
`;

const wineDetailFields = groq`
  ${wineCardFields},
  description,
  tastingNotes,
  grapeVariety,
  alcoholContent,
  abv,
  origin,
  age,
  stock,
  variants,
  stockCount,
  "images": select(defined(bottleImage) => [bottleImage] + coalesce(images, []), coalesce(images, [])),
  pairings,
  seo
`;

export function getAllWines(categorySlug?: string) {
  const query = categorySlug
    ? groq`*[_type == "wine" && category->slug.current == $categorySlug && !(_id in path("drafts.**"))] | order(title asc) {${wineCardFields}}`
    : groq`*[_type == "wine" && !(_id in path("drafts.**"))] | order(title asc) {${wineCardFields}}`;

  return sanityFetch<WineCardResult[]>({
    query,
    params: { categorySlug },
  });
}

export function getWineBySlug(slug: string) {
  return sanityFetch<WineDetailResult | null>({
    query: groq`*[_type == "wine" && slug.current == $slug][0] {${wineDetailFields}}`,
    params: { slug },
  });
}

export function getFeaturedWines() {
  return sanityFetch<WineCardResult[]>({
    query: groq`*[_type == "wine" && featured == true] | order(title asc) {${wineCardFields}}`,
  });
}

export function getCategories() {
  return sanityFetch<SanityCategory[]>({
    query: groq`*[_type == "wineCategory"] | order(title asc) {${categoryFields}}`,
  });
}

export function getAllWinesForSearch() {
  return sanityFetch<WineCardResult[]>({
    query: groq`*[_type == "wine" && !(_id in path("drafts.**"))] | order(title asc) {${wineCardFields}}`,
  });
}

export function searchWines(query: string) {
  return sanityFetch<WineCardResult[]>({
    query: groq`*[_type == "wine" && title match $searchTerm] | order(title asc) {${wineCardFields}}`,
    params: { searchTerm: `${query}*` },
  });
}

export function getLikedWines(ids: string[]) {
  return sanityFetch<WineCardResult[]>({
    query: groq`*[_type == "wine" && _id in $ids] | order(title asc) {${wineCardFields}}`,
    params: { ids },
  });
}

const siteSettingsQuery = groq`*[_type == "siteSettings"][0]{
  heroHeadline,
  heroSubtext,
  heroImage,
  seo{
    siteTitle,
    titleTemplate,
    defaultDescription,
    keywords,
    "defaultOgImage": defaultOgImage{ "url": asset->url, alt }
  },
  org{
    name,
    "logo": logo{ "url": asset->url },
    phone,
    email,
    addressLocality,
    addressCountry,
    social
  },
  verification,
  robots,
  pages[]{
    pageKey,
    title,
    description,
    "ogImage": ogImage{ "url": asset->url, alt }
  }
}`;

export function getSiteSettings() {
  return sanityFetch<SiteSettingsResult | null>({
    query: siteSettingsQuery,
    // Cache settings for an hour — they change rarely and are read on every
    // page's metadata build.
    revalidate: 3600,
  });
}
