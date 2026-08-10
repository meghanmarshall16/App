# Trip's Trips

A personal travel itinerary app: day-by-day plans, packing lists, calendar view, and a spot for your dogs' photo.

## Features

- Create trips with destination, dates, and a cover tone
- Calendar view of trip days
- Day-by-day itinerary from your date range
- Packing lists with destination-based packing items
- Upload a photo of your dogs on the home page
- Data saved in your browser (`localStorage`)
- Share trips with a partner via link or downloadable file

## Get started

From the project folder (the one with `package.json`):

```bash
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`).

## Share trips with a partner

Trips live in each browser until you send them:

1. Open **Trips** → **Copy share link** (or **Download trips file**)
2. Send that to your partner
3. They open the link (or **Import trips** and upload/paste)

Share again whenever you change plans. Matching trip IDs update on import instead of duplicating.

## Scripts

- `npm run dev` — start the development server
- `npm run build` — typecheck and production build
- `npm run preview` — preview the production build
- `npm run lint` — run oxlint
