# MyriMarket V1 (Supabase Dropshipping Scaffold)

V1 blueprint + implementation scaffold for a dropshipping system with:

1. **Storefront**: products, categories, product detail pages
2. **Admin dashboard**: reviewed products view
3. **Ingestion hook**: Product Radar daily upsert into Supabase
4. **Schema**: `products`, `sources`, `scores`, `sync_runs` (+ `categories`)
5. **API routes**: ingestion + cron-ready daily sync endpoint
6. **Deployment notes**: env vars + run steps

---

## Architecture (V1)

- `apps/web` → Next.js storefront/admin UI
- `apps/api` → Express API layer
- `supabase/migrations/001_init.sql` → database schema
- `modules/product-radar` → upstream candidate feed source

Data flow:

`Product Radar report -> /cron/daily-sync or /ingestion/product-radar/upsert -> Supabase tables -> /products API -> storefront`

---

## Supabase schema

Apply SQL from:

- `supabase/migrations/001_init.sql`

Tables:

- `categories`
- `sources`
- `products`
- `sync_runs`
- `scores`

---

## API endpoints

### Public
- `GET /health`
- `GET /categories`
- `GET /products?categorySlug=<slug>&reviewedOnly=true|false`
- `GET /products/:id` (slug or UUID)

### Admin
- `POST /admin/login`
- `GET /admin/reviewed-products` (requires `x-admin-token`)
- `PUT /admin/products/:id/review` (requires `x-admin-token`)

### Ingestion / Cron
- `POST /ingestion/product-radar/upsert` (requires `x-ingestion-key`)
- `POST /cron/daily-sync` (requires `x-ingestion-key`)
  - Reads latest `modules/product-radar/reports/*/product-radar-report.json`
  - Upserts products/sources/categories
  - Inserts score snapshots and sync run record

---

## Environment variables

### API (`apps/api/.env`)

```env
PORT=4001
WEB_ORIGIN=http://localhost:3000
ADMIN_TOKEN=change-me
INGESTION_API_KEY=change-me-too

SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

PAYSTACK_SECRET_KEY=
```

### Web (`apps/web/.env.local`)

```env
NEXT_PUBLIC_API_BASE=http://localhost:4001
```

---

## Local run instructions

From repo root (`myrimarket`):

```bash
npm install
npm run dev
```

This starts:

- Web on `http://localhost:3000`
- API on `http://localhost:4001`

### One-time setup

1. Create Supabase project
2. Run SQL in `supabase/migrations/001_init.sql`
3. Fill `apps/api/.env` with Supabase keys
4. Start app

### Manual daily sync test

```bash
curl -X POST http://localhost:4001/cron/daily-sync \
  -H "x-ingestion-key: change-me-too"
```

---

## Deployment notes

- Deploy `apps/web` to Vercel (set `NEXT_PUBLIC_API_BASE`)
- Deploy `apps/api` to Render/Railway/Fly (set API envs)
- Point cron (GitHub Actions / platform scheduler) to `POST /cron/daily-sync`
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only

---

## Changed files summary

- `apps/api/src/index.js` (Supabase-backed API + ingestion + cron route)
- `apps/api/src/supabase.js` (Supabase admin client)
- `apps/api/src/slugify.js` (ingestion slug helper)
- `apps/api/package.json` (switch to `@supabase/supabase-js`)
- `apps/api/.env.example` (Supabase + ingestion env vars)
- `apps/web/src/lib/api.ts` (new API contract)
- `apps/web/src/components/TopNav.tsx` (category slug navigation)
- `apps/web/src/app/page.tsx` (reviewed products feed)
- `apps/web/src/app/categories/page.tsx` (category listing page)
- `apps/web/src/app/categories/[slug]/page.tsx` (category detail page)
- `apps/web/src/app/admin/page.tsx` (reviewed products dashboard)
- `supabase/migrations/001_init.sql` (schema)
- `README.md` (blueprint + setup + deploy)
