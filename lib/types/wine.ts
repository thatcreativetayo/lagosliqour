export type WineCategory =
  | "Red Wine"
  | "White Wine"
  | "Sparkling"
  | "Rosé"
  | "Spirits";

export interface Wine {
  id: string;
  name: string;
  tagline: string;
  description: string;
  note: string;
  vintage: string;
  abv: string;
  price: number;
  category: WineCategory;
  featured: boolean;
  accent: string;
  glow: string;
  image: string;
}
