# Lagos Liquor - Quick Start Guide

Get the wine store running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Git installed

## 1. Install Dependencies

```bash
pnpm install
```

## 2. Set Up Environment Variables

Create `.env.local` file:

```bash
cp .env.example .env.local
```

### Minimum Required for Development:

```env
# Sanity (create at sanity.io)
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-06-09

# Supabase (create at supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Credo (create at credocentral.com)
CREDO_SECRET_KEY=your_secret_key
CREDO_PUBLIC_KEY=your_public_key

# Local development
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 3. Set Up Supabase Database

1. Go to your Supabase project
2. Click "SQL Editor" in the left sidebar
3. Copy the contents of `supabase-migration.sql`
4. Paste and run it
5. Verify the `orders` table was created

## 4. Set Up Sanity CMS

### Option A: Use Existing Sanity Project
If you already have a Sanity project:
1. Add your project ID to `.env.local`
2. The schemas are in `sanity/schemas/`
3. Deploy them to your Sanity project

### Option B: Create New Sanity Project
```bash
cd sanity
npx sanity init
# Follow the prompts
npx sanity deploy
```

Add some sample wine products in Sanity Studio.

## 5. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## 6. Test the Features

### Test Cart:
1. Go to `/shop`
2. Click "Add to cart" on any product
3. Click cart icon in navbar (should show badge)
4. Go to `/cart`
5. Update quantities, remove items

### Test Likes:
1. Click heart icon on any product
2. Go to `/liked` 
3. View your saved wines

### Test Product Page:
1. Click on any wine card
2. View full details
3. Change quantity
4. Add to cart

### Test Checkout:
1. Add items to cart
2. Go to `/checkout`
3. Fill out the form
4. Click "Proceed to Payment"
5. (Will redirect to Credo if configured)

## Common Issues

### "Missing Sanity project ID"
- Make sure `NEXT_PUBLIC_SANITY_PROJECT_ID` is set in `.env.local`
- Restart dev server after adding env vars

### "Failed to create order"
- Check Supabase credentials
- Verify the migration ran successfully
- Check browser console for errors

### "Payment gateway not configured"
- Credo keys not set or invalid
- Check `.env.local` has `CREDO_SECRET_KEY`

### Images not loading
- Check Sanity project has images uploaded
- Verify remote patterns in `next.config.ts` include your image domains

### TypeScript errors
```bash
pnpm tsc --noEmit
```

### Clear caches
```bash
rm -rf .next
pnpm dev
```

## Development Workflow

1. **Add products in Sanity Studio**
   - Run `cd sanity && npx sanity start`
   - Open http://localhost:3333
   - Create wine products

2. **View on frontend**
   - Products appear automatically on `/shop`
   - ISR caches for 60 seconds

3. **Test payment flow**
   - Use Credo test keys
   - Test cards available in Credo docs

## Next Steps

- Add real wine products in Sanity
- Configure Credo test/live keys
- Customize branding and copy
- Add more product images
- Test on mobile devices

## Need Help?

Check the full documentation:
- `SETUP.md` - Detailed setup guide
- `IMPLEMENTATION-REPORT.md` - What's implemented
- `README.md` - Project overview

## Production Deployment

When ready to deploy:
1. Push to GitHub
2. Deploy to Vercel
3. Add all env vars in Vercel dashboard
4. Update `NEXT_PUBLIC_BASE_URL` to your domain
5. Test payment flow end-to-end

---

That's it! You're ready to start developing. 🍷
