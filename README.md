# Trip's Trips

A personal travel itinerary app: day-by-day plans, packing lists, calendar view, and a spot for your dogs' photo.

## Features

- Create trips with destination, dates, and a cover tone
- Calendar view of trip days
- Day-by-day itinerary from your date range
- Packing lists with destination-based packing items
- Upload a photo of your dogs on the home page
- Local backup in your browser (`localStorage`)
- **Cloud sync** so everyone with your space code sees live updates
- One-time share via link or downloadable file

## Get started

From the project folder (the one with `package.json`):

```bash
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`).

## Cloud sync (updates for anyone)

Browser storage only lives on one phone. For live shared trips:

1. Create a free project at [supabase.com](https://supabase.com)
2. In **SQL Editor**, run `supabase/schema.sql`
3. Copy **Project URL** and **anon public** key from **Project Settings → API**
4. Add them as env vars (local `.env.local` and Vercel → Settings → Environment Variables):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Redeploy on Vercel
6. In the app: **Trips → Start cloud sync** → send the space code to your partner
7. Partner opens the same app → **Join with a code**

Treat the space code like a shared password.

## One-time share

Without cloud sync, you can still send a snapshot:

1. Open **Trips** → **Copy share link** (or **Download trips file**)
2. Send that to your partner
3. They open the link (or **Import trips** and upload/paste)

## Scripts

- `npm run dev` — start the development server
- `npm run build` — typecheck and production build
- `npm run preview` — preview the production build
- `npm run lint` — run oxlint
