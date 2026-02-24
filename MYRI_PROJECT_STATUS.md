# MYRI Project Status

_Last updated: 2026-02-17 (Africa/Lagos)_

## Current Position

### 1) Frontend + Backend Connectivity
- Frontend is live on Vercel: `https://myrimarket-web.vercel.app`
- Backend API is live on Vercel: `https://api-eight-gilt-84.vercel.app`
- Frontend `NEXT_PUBLIC_API_BASE` is connected to the live API.

### 2) Pricing Logic Implemented
- Pricing rule active:
  - `USD -> NGN` at `1 USD = 1,500 NGN`
  - `+40% markup`
  - Rounded to nearest `₦500`
- BTC is currently disabled as requested.

### 3) Catalog Progress
- 20 product types configured (Plati-aligned structure).
- Variant selector implemented on product detail pages.
- Each product has variant options (duration/denomination style).
- Product source metadata added (source URL/vendor labels).

### 4) UI Progress
- Product cards render with product-specific images.
- Product detail page includes:
  - Hero image
  - Variant selector
  - Dynamic NGN price per selected variant
  - Source/vendor label

### 5) Deployment/Runtime Notes
- Recent frontend and API deployments completed successfully.
- One local `npx vercel` cache error occurred (`ENOENT chunk-FUW6HC6T.js`) during a run, but subsequent deploys completed and alias is healthy.

## Open Items / Next Steps
1. Deep pass on Plati product pages to mirror exact vendor variant ladders 1:1 for all 20 products.
2. Replace generated placeholder branded images with final product-specific creatives.
3. Move API data from in-file static structures to persistent DB-backed catalog + admin-managed updates.
4. Final QA checklist:
   - Variant switching + payment init for selected variant
   - Category filtering consistency
   - Mobile layout checks

## Working Files Changed (local)
- `apps/api/api/index.js`
- `apps/api/vercel.json`
- `apps/web/src/lib/api.ts`
- `apps/web/src/components/ProductCard.tsx`
- `apps/web/src/components/VariantPurchaseCard.tsx`
- `apps/web/src/app/products/[id]/page.tsx`
- `apps/web/public/products/*`

## Quick Verification Endpoints
- API health: `https://api-eight-gilt-84.vercel.app/health`
- API products: `https://api-eight-gilt-84.vercel.app/products`
- Live site: `https://myrimarket-web.vercel.app`
