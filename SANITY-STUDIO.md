# Sanity Studio Setup

## Access Sanity Studio

### Local Development
1. Run your dev server: `pnpm dev`
2. Navigate to: http://localhost:3000/studio
3. Sign in with your Sanity account

### Production (Vercel)
1. Navigate to: https://lagosliqour.vercel.app/studio
2. Sign in with your Sanity account

## Add Products

1. In Sanity Studio, click **Wine** in the sidebar
2. Click **Create** (+ button)
3. Fill in the product details:
   - **Title**: Product name
   - **Slug**: URL-friendly slug (auto-generated from title)
   - **Price**: Price in Naira (e.g., 58000)
   - **Compare Price**: Optional strikethrough price
   - **Description**: Full product description
   - **Stock Count**: Number of bottles in stock
   - **In Stock**: Toggle on/off
   - **Featured**: Toggle to show on homepage
   - **Rating**: Star rating (0-5)
   - **Category**: Select or create a category
   - **Images**: Upload product images
   - **Tasting Notes**: Add flavor notes (e.g., "Crisp agave", "Citrus peel")
   - **Food Pairings**: Add pairing suggestions
   - **Origin/Region**: Where the product is from
   - **Grape Variety**: Type of grape or agave
   - **Vintage**: Year
   - **Alcohol Content**: ABV (e.g., "40%")
   - **Bottle Size**: Size (e.g., "750ml")
   - **Accent Color**: Hex color for product page background

4. Click **Publish**

## Seeded Products

You've already seeded 6 premium tequila products:
- Casamigos Blanco
- Casamigos Reposado
- Casamigos Anejo
- Casamigos Cristalino Reposado
- Casamigos Mezcal
- Don Julio 1942 Anejo

These products are missing images. You can:
1. Open each product in the studio
2. Upload proper product images
3. Republish

## All Product Data Sources

✅ **Homepage** (`/`) - Fetches featured wines from Sanity
✅ **Shop page** (`/shop`) - Fetches all wines from Sanity
✅ **Wine detail page** (`/wines/[slug]`) - Fetches individual wine from Sanity
✅ **Related products** - Fetches by category from Sanity

Everything is connected to Sanity CMS!
