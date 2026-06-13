// Load environment variables from .env.local
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env.local') });

const projectId = process.env.SANITY_PROJECT_ID ?? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET ?? process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const apiVersion = process.env.SANITY_API_VERSION ?? process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-06-09";
const token = process.env.SANITY_API_WRITE_TOKEN ?? process.env.SANITY_WRITE_TOKEN;

if (!projectId || !token) {
  console.error("Missing SANITY_PROJECT_ID/NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN.");
  process.exit(1);
}

const categoryId = "wineCategory.tequila";  

const category = {
  _id: categoryId,
  _type: "wineCategory",
  title: "Ultra-Premium Tequila",
  slug: { _type: "slug", current: "ultra-premium-tequila" },
  description: "Ultra-premium agave spirits selected for Lagos collectors, gifting, and private tables.",
};

const products = [
  {
    slug: "casamigos-blanco",
    title: "Casamigos Blanco",
    price: 58000,
    comparePrice: 65000,
    description:
      "A crisp, clean 100% Blue Weber agave blanco tequila for premium cocktails, neat pours, and bright Lagos evenings.",
    tastingNotes: ["Crisp agave", "Citrus peel", "Vanilla", "Clean mineral finish"],
    age: "Unaged, rested up to 2 months",
    accentColor: "#F5F5F5",
    stock: 18,
    rating: 4.8,
    featured: true,
    imageUrl: "https://www.consuvino.com.mx/product-page/tequila-casamigos-blanco-750ml",
    imageSourceUrl: "https://www.consuvino.com.mx/product-page/tequila-casamigos-blanco-750ml",
  },
  {
    slug: "casamigos-reposado",
    title: "Casamigos Reposado",
    price: 72000,
    comparePrice: 82000,
    description:
      "A honey-gold reposado with gentle oak, soft cocoa, and sweet agave depth. A smooth bottle for premium hosting.",
    tastingNotes: ["Caramel", "Cocoa", "Dried fruit", "Spiced oak"],
    age: "7 months in American white oak",
    accentColor: "#D4A017",
    stock: 14,
    rating: 4.9,
    featured: true,
    imageUrl: "https://topshelfwineandspirits.com/products/casamigos-casamigos-reposado-1-75-l",
    imageSourceUrl: "https://topshelfwineandspirits.com/products/casamigos-casamigos-reposado-1-75-l",
  },
  {
    slug: "casamigos-anejo",
    title: "Casamigos Anejo",
    price: 86000,
    comparePrice: 96000,
    description:
      "A richer Casamigos expression with amber warmth, round oak, and a polished finish made for after-dinner sipping.",
    tastingNotes: ["Toffee", "Baking spice", "Roasted agave", "Soft oak"],
    age: "14 months in American white oak",
    accentColor: "#C48B3E",
    stock: 11,
    rating: 4.9,
    featured: true,
    imageUrl: "https://kosherwinedirect.com/products/casamigos-tequila-anjeo-750ml",
    imageSourceUrl: "https://kosherwinedirect.com/products/casamigos-tequila-anjeo-750ml",
  },
  {
    slug: "casamigos-cristalino-reposado",
    title: "Casamigos Cristalino Reposado",
    price: 92000,
    comparePrice: 105000,
    description:
      "Crystal-clear reposado character with aged tequila softness, polished for luxury gifting and sleek table service.",
    tastingNotes: ["Cooked agave", "Vanilla", "Light oak", "Silky finish"],
    age: "Barrel-aged reposado, charcoal filtered",
    accentColor: "#E8E8E8",
    stock: 9,
    rating: 4.8,
    featured: true,
    imageUrl: "https://www.casamigostequila.com/",
    imageSourceUrl: "https://www.casamigostequila.com/",
  },
  {
    slug: "casamigos-mezcal",
    title: "Casamigos Mezcal",
    price: 78000,
    comparePrice: 89000,
    description:
      "A smoky premium mezcal with herbal agave intensity, created for collectors who want a more dramatic pour.",
    tastingNotes: ["Smoke", "Tamarind", "Herbs", "Black pepper"],
    age: "Joven",
    accentColor: "#2C2C2C",
    stock: 10,
    rating: 4.7,
    featured: false,
    imageUrl: "https://www.casamigostequila.com/",
    imageSourceUrl: "https://www.casamigostequila.com/",
  },
  {
    slug: "don-julio-1942-anejo",
    title: "Don Julio 1942 Anejo",
    price: 165000,
    comparePrice: 185000,
    description:
      "The iconic golden-amber luxury tequila, aged for a deep, elegant sipping profile and built for milestone celebrations.",
    tastingNotes: ["Warm oak", "Caramel", "Vanilla", "Roasted agave"],
    age: "2+ years",
    accentColor: "#B38B4D",
    stock: 7,
    rating: 5,
    featured: true,
    imageUrl: "https://www.pngkey.com/png/detail/275-2755123_zoom-images-don-julio-1942-bottle.png",
    imageSourceUrl: "https://www.pngkey.com/detail/u2w7u2q8r5i1e6o0_zoom-images-don-julio-1942-bottle/",
  },
];

function mutationUrl() {
  return `https://${projectId}.api.sanity.io/v${apiVersion}/data/mutate/${dataset}`;
}

function assetUrl(fileName) {
  return `https://${projectId}.api.sanity.io/v${apiVersion}/assets/images/${dataset}?filename=${encodeURIComponent(fileName)}`;
}

function headers(extra = {}) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

function slugToId(slug) {
  return `wine.${slug}`;
}

function variantFor(product) {
  return [
    {
      _key: `${product.slug}-750ml`,
      label: "750ml bottle",
      size: "750ml",
      price: product.price,
      stock: product.stock,
      sku: `LL-${product.slug.toUpperCase().replace(/-/g, "-")}-750`,
    },
  ];
}

async function uploadImage(product) {
  try {
    const response = await fetch(product.imageUrl);
    const contentType = response.headers.get("content-type") ?? "";

    if (!response.ok || !contentType.startsWith("image/")) {
      console.warn(`Skipping image upload for ${product.title}: source is not a direct image URL.`);
      return null;
    }

    const bytes = Buffer.from(await response.arrayBuffer());
    const extension = contentType.split("/")[1]?.split(";")[0] ?? "png";
    const upload = await fetch(assetUrl(`${product.slug}.${extension}`), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": contentType,
      },
      body: bytes,
    });

    if (!upload.ok) {
      console.warn(`Skipping image upload for ${product.title}: ${await upload.text()}`);
      return null;
    }

    const payload = await upload.json();
    return payload.document?._id ? {
      _type: "image",
      asset: { _type: "reference", _ref: payload.document._id },
      alt: `${product.title} 750ml bottle`,
      sourceUrl: product.imageSourceUrl,
    } : null;
  } catch (error) {
    console.warn(`Skipping image upload for ${product.title}: ${error.message}`);
    return null;
  }
}

async function commit(mutations) {
  const response = await fetch(mutationUrl(), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ mutations }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

async function main() {
  console.log(`Seeding ${products.length} premium tequila products into ${projectId}/${dataset}...`);

  await commit([{ createOrReplace: category }]);

  for (const product of products) {
    const bottleImage = await uploadImage(product);
    const imageFields = bottleImage ? { bottleImage, images: [bottleImage] } : { images: [] };

    const document = {
      _id: slugToId(product.slug),
      _type: "wine",
      title: product.title,
      name: product.title,
      slug: { _type: "slug", current: product.slug },
      price: product.price,
      comparePrice: product.comparePrice,
      description: product.description,
      tastingNotes: product.tastingNotes,
      origin: "Jalisco, Mexico",
      region: "Jalisco, Mexico",
      abv: "40%",
      alcoholContent: "40%",
      age: product.age,
      vintage: 2026,
      grapeVariety: "100% Blue Weber Agave",
      bottleSize: "750ml",
      inStock: product.stock > 0,
      stock: product.stock,
      stockCount: product.stock,
      variants: variantFor(product),
      category: { _type: "reference", _ref: categoryId },
      featured: product.featured,
      rating: product.rating,
      pairings: ["Lagos small chops", "Grilled seafood", "Dark chocolate"],
      accentColor: product.accentColor,
      ...imageFields,
    };

    await commit([{ createOrReplace: document }]);
    console.log(`Seeded ${product.title}`);
  }

  console.log("Done. Review product images in Sanity Studio and replace non-direct source uploads with transparent PNG assets where needed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
