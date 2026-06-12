# Lagos Liquor - Setup Guide

Production-ready wine e-commerce platform built with Next.js, Sanity CMS, Supabase, and Credo payment integration.

## Features Implemented

✅ **Sanity CMS Integration**
- Wine products with full details (title, price, description, images, tasting notes, pairings)
- Wine categories
- Site settings
- All queries optimized with ISR (60s revalidation)

✅ **Product Pages**
- Dynamic wine detail pages with image gallery
- Tasting notes and food pairings
- Stock management
- Rating display
- Related products section
- Full mobile responsiveness

✅ **Shopping Cart**
- LocalStorage-backed cart with Zustand pattern
- Add/remove/update quantity
- Line totals and subtotals
- Persistent across sessions
- Real-time cart badge in navbar

✅ **Liked/Wishlist**
- LocalStorage-backed wishlist
- Like/unlike functionality
- Dedicated liked wines page
- Heart icon toggle on all product cards

✅ **Checkout Flow**
- Single-page checkout form
- Form validation with Zod + React Hook Form
- Nigerian states dropdown
- Delivery fee calculation (₦2,000 or free above ₦50,000)
- Order summary with line items

✅ **Payment Integration (Credo)**
- Order creation API
- Payment initiation API
- Payment verification with webhooks
- Success/failure pages
- Order status updates in Supabase

✅ **Additional Polish**
- Loading/error/not-found states
- Empty state handling
- Smooth animations with Framer Motion
- Mobile-first responsive design
- Accessibility labels

---

## Environment Setup

### 1. Create `.env.local` file

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

### 2. Sanity CMS Setup

1. Create a Sanity project at [sanity.io](https://www.sanity.io/)
2. Install Sanity CLI: `npm install -g @sanity/cli`
3. Initialize Sanity in the `sanity/` folder:
   ```bash
   cd sanity
   sanity init
   ```
4. Deploy the schemas:
   ```bash
   sanity deploy
   ```
5. Add your project ID to `.env.local`:
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
   NEXT_PUBLIC_SANITY_DATASET=production
   ```

6. Add some sample wine products in Sanity Studio (localhost:3333 by default)

### 3. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migration in `supabase-migration.sql`
3. Get your project URL and keys from Settings → API
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

⚠️ **IMPORTANT:** Never expose `SUPABASE_SERVICE_ROLE_KEY` in client code. It's only used in API routes.

### 4. Credo Payment Setup

1. Create a Credo account at [credocentral.com](https://credocentral.com)
2. Get your API keys from the dashboard
3. Add to `.env.local`:
   ```
   CREDO_SECRET_KEY=your_secret_key
   CREDO_PUBLIC_KEY=your_public_key
   ```

4. Set your production URL:
   ```
   NEXT_PUBLIC_BASE_URL=https://yourdomain.com
   ```
   (Use `http://localhost:3000` for local development)

---

## Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── orders/route.ts          # Order creation
│   │   └── payment/
│   │       ├── initiate/route.ts    # Payment initialization
│   │       └── verify/route.ts      # Payment verification
│   ├── cart/                        # Shopping cart page
│   ├── checkout/                    # Checkout form
│   ├── liked/                       # Liked wines page
│   ├── payment/verify/              # Payment success/failure
│   ├── shop/                        # All products page
│   └── wines/[slug]/                # Product detail pages
├── components/
│   ├── home/                        # Landing page sections
│   ├── layout/                      # Navbar, Footer
│   ├── product/                     # Product gallery, actions
│   ├── providers/                   # Motion, Smooth scroll
│   └── ui/                          # Buttons, cards, tags
├── lib/
│   ├── data/                        # Static wine data (fallback)
│   ├── sanity/                      # Sanity client, queries, types
│   ├── stores/                      # Cart and liked stores
│   ├── supabase/                    # Supabase clients
│   ├── types/                       # TypeScript types
│   └── validations/                 # Zod schemas
├── sanity/schemas/                  # Sanity CMS schemas
└── public/                          # Static assets
```

---

## Deployment Checklist

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy

### Environment Variables to Set in Vercel

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_SANITY_API_VERSION`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CREDO_SECRET_KEY`
- `CREDO_PUBLIC_KEY`
- `NEXT_PUBLIC_BASE_URL` (your production URL)

### Post-Deployment

1. Test payment flow end-to-end
2. Verify Credo webhook callback URL is reachable
3. Add wine products in Sanity Studio
4. Test on mobile devices
5. Enable Supabase RLS policies if using authentication

---

## API Routes

### POST `/api/orders`
Creates a new order in Supabase.

**Request:**
```json
{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+2348012345678",
  "state": "Lagos",
  "city": "Ikeja",
  "streetAddress": "123 Allen Avenue",
  "landmark": "Near Shoprite",
  "deliveryNotes": "Call before delivery",
  "items": [...],
  "subtotal": 100000,
  "deliveryFee": 2000,
  "total": 102000
}
```

**Response:**
```json
{
  "orderId": "uuid",
  "reference": "unique-reference"
}
```

### POST `/api/payment/initiate`
Initiates payment with Credo.

**Request:**
```json
{
  "reference": "order-reference",
  "orderId": "uuid",
  "amount": 102000,
  "email": "john@example.com",
  "customerName": "John Doe"
}
```

**Response:**
```json
{
  "authorizationUrl": "https://credo-checkout-url",
  "reference": "payment-reference"
}
```

### GET `/api/payment/verify?reference=xxx`
Verifies payment status and updates order.

**Response (success):**
```json
{
  "status": "success",
  "reference": "payment-reference",
  "data": {...}
}
```

**Response (failed):**
```json
{
  "status": "failed",
  "reference": "payment-reference",
  "message": "Payment declined"
}
```

---

## Development Notes

### Next.js 16.2.7 Specifics
- Uses Tailwind CSS v4 with `@theme` syntax
- App Router with React Server Components by default
- `params` and `searchParams` are now promises (must await)
- Native TypeScript support without explicit config

### State Management
- Cart and liked stores use `useSyncExternalStore` pattern
- No external state library needed (React 19 built-in)
- LocalStorage for persistence

### Styling
- Tailwind CSS v4 with custom theme in `app/globals.css`
- Custom fonts: Retcaro (serif), Sentient (sans)
- Colors: cream, ink, wine, gold, dark
- No arbitrary values used — all design tokens defined

### Performance
- ISR with 60s revalidation on Sanity queries
- Image optimization with next/image
- Framer Motion for smooth animations
- Lenis for smooth scrolling

---

## Troubleshooting

### "Missing Supabase environment variables"
Make sure all three Supabase env vars are set in `.env.local`

### "Payment gateway not configured"
Check that `CREDO_SECRET_KEY` is set correctly

### "Failed to fetch liked wines"
Ensure Sanity project ID is correct and dataset is "production"

### Images not loading
Add your image domains to `next.config.ts` under `remotePatterns`

### Build errors
Run `pnpm install` to ensure all dependencies are installed, including:
- `@supabase/supabase-js`
- `react-hook-form`
- `zod`
- `@hookform/resolvers`
- `nanoid`
- `next-sanity`

---

## Support

For issues or questions, refer to:
- [Next.js Docs](https://nextjs.org/docs)
- [Sanity Docs](https://www.sanity.io/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Credo Docs](https://docs.credy.com.ng)

---

## License

Proprietary - Lagos Liquor © 2024
