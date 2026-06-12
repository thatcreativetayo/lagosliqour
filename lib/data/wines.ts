import type { Wine } from "@/lib/types/wine";

export const WINES: Wine[] = [
  {
    id: "lagos-noir",
    name: "Lagos Noir",
    tagline: "The midnight of your palate.",
    description:
      "Dark plum, tobacco leaf, and a cedar finish that lingers like a Lagos night. For those who take their evenings seriously.",
    note: "Cabernet Sauvignon · Bordeaux, France",
    vintage: "2019",
    abv: "14.5%",
    price: 48000,
    category: "Red Wine",
    featured: true,
    accent: "#C9924A",
    glow: "140, 30, 30",
    image:
      "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=600&q=85",
  },
  {
    id: "eko-reserve",
    name: "Eko Reserve",
    tagline: "Crafted for the refined few.",
    description:
      "Velvet texture, dark cherry, wild herbs. A wine that understands your schedule.",
    note: "Merlot Blend · Burgundy, France",
    vintage: "2020",
    abv: "13.8%",
    price: 62000,
    category: "Red Wine",
    featured: true,
    accent: "#A8C4D8",
    glow: "40, 40, 160",
    image:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=85",
  },
  {
    id: "victoria-brut",
    name: "Victoria Brut",
    tagline: "Silence, poured.",
    description:
      "Toasted brioche, green apple, crisp minerality. The language of celebration.",
    note: "Blanc de Blancs · Champagne, France",
    vintage: "NV",
    abv: "12.5%",
    price: 95000,
    category: "Sparkling",
    featured: true,
    accent: "#D4AF37",
    glow: "50, 130, 50",
    image:
      "https://images.unsplash.com/photo-1569400605346-1f748e4e21a8?w=600&q=85",
  },
  {
    id: "lekki-rouge",
    name: "Lekki Rouge",
    tagline: "Bold. Unapologetic.",
    description:
      "Dark cherry, cracked pepper, smoked oak. Built for the moment you've earned.",
    note: "Shiraz · Barossa Valley, Australia",
    vintage: "2018",
    abv: "15.2%",
    price: 55000,
    category: "Red Wine",
    featured: true,
    accent: "#E8A87C",
    glow: "130, 20, 20",
    image:
      "https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=600&q=85",
  },
  {
    id: "abeokuta-blanc",
    name: "Abeokuta Blanc",
    tagline: "The eloquence of restraint.",
    description:
      "Butter, citrus zest, white peach. For the days that deserve far more.",
    note: "Chardonnay · Chablis, France",
    vintage: "2021",
    abv: "13.2%",
    price: 41000,
    category: "White Wine",
    featured: false,
    accent: "#F5E6C8",
    glow: "180, 155, 60",
    image:
      "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=600&q=85",
  },
  {
    id: "island-rose",
    name: "Island Rosé",
    tagline: "The colour of the right moment.",
    description:
      "Fresh strawberry, rose petal, white pepper. Lagos at golden hour in a glass.",
    note: "Grenache Rosé · Provence, France",
    vintage: "2022",
    abv: "12.8%",
    price: 38000,
    category: "Rosé",
    featured: false,
    accent: "#E8A0A0",
    glow: "200, 100, 100",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=85",
  },
];
