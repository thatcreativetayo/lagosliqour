export interface SanityImage {
  _key?: string;
  alt?: string;
  asset?: {
    _ref?: string;
    url?: string;
  };
}

export interface SanityCategory {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  image?: SanityImage;
}

export interface WineCardResult {
  _id: string;
  title: string;
  name?: string;
  slug: string;
  price: number;
  comparePrice?: number;
  region?: string;
  origin?: string;
  vintage?: number;
  bottleSize?: string;
  inStock: boolean;
  stock?: number;
  stockCount?: number;
  rating?: number;
  featured?: boolean;
  image?: SanityImage;
  bottleImage?: SanityImage;
  category?: SanityCategory;
  accentColor?: string;
  tastingNotes?: string[];
  abv?: string;
  age?: string;
  variants?: ProductVariant[];
}

export interface WineDetailResult extends Omit<WineCardResult, "image"> {
  description?: string;
  tastingNotes?: string[];
  grapeVariety?: string;
  alcoholContent?: string;
  abv?: string;
  origin?: string;
  age?: string;
  stock?: number;
  variants?: ProductVariant[];
  stockCount?: number;
  images?: SanityImage[];
  pairings?: string[];
}

export interface ProductVariant {
  _key?: string;
  label: string;
  size: string;
  price: number;
  stock?: number;
  sku?: string;
}

export interface SiteSettingsResult {
  heroHeadline: string;
  heroSubtext: string;
  heroImage?: SanityImage;
  featuredWines: WineCardResult[];
}
