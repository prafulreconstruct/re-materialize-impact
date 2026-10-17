# ReConstruct

A marketplace for salvaged and surplus construction materials across NCR (Noida, Gurugram, Delhi). Sellers list leftover materials from demolition or excess stock. Buyers browse, submit quotes, and deal directly with the site, with no middleman and no commission.

## Tech stack

- React + TanStack Router, built with Vite
- Supabase for auth, the Postgres database, and image storage (`listing-images` bucket)
- Deployed on Vercel

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root:

   ```
   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<publishable-key>
   ```

   Both values are in the Supabase dashboard under **Project Settings → API**.

3. Start the dev server:

   ```bash
   npm run dev
   ```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the local dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |

## Database

SQL migrations are in `src/migrations`. Run them in order in the Supabase SQL Editor:

| File | Purpose |
|---|---|
| `0001_initial_schema.sql` | Tables: profiles, categories, listings, interests, cart, threads, messages, orders |
| `0002_policies.sql` | Grants and row-level security policies |
| `0003_seed_categories.sql` | Material categories |
| `0004_listing_images.sql` | Image storage bucket and `image_paths` column |
| `0005_seed_sold_listings.sql` | Archive of lots sold Aug–Oct 2026, shown with a SOLD tag |

`schema.txt` has a table-by-table overview.

> The live database's category codes have drifted from `0003_seed_categories.sql` (for example, MAT-07 is Masonry & Blocks and MAT-08 is Other). Check the live `material_categories` table before adding new categories.

## Listings and the site logbook

- Listings have the status `live`, `paused` or `sold`. The home and browse pages show live listings first, then sold ones, which carry a SOLD tag and can't be quoted on.
- The **Site logbook** on the home page is calculated as follows:
  - **Deals closed:** sold listings plus in-app orders.
  - **Quotes submitted:** 13 quotes received on the archived sold lots (`SOLD_LOT_QUOTES` in `src/routes/index.tsx`), plus quotes submitted in the app.
  - **Saved vs market rate:** market price minus sale price, summed across sold listings and orders.

## Deployment (Vercel)

1. Under **Settings → Environment Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then redeploy. `VITE_*` values are baked into the build at build time.
2. In Supabase, under **Authentication → URL Configuration**, set the Site URL to the Vercel domain and add it to Redirect URLs.

`vercel.json` rewrites all routes to `index.html` so client-side routing works.

## Security note

The current RLS policies (`0002_policies.sql`) allow full read and write access to the anon role. Anyone with the publishable key, which is visible in the browser, can change data. Tighten these policies before relying on the site in production.
