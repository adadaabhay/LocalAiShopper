## ShopSense Phone Advisor

**Repository:** [github.com/adadaabhay/ShopSenseAi](https://github.com/adadaabhay/ShopSenseAi)

**Live demo (Vercel):** [shop-sense-ai-real.vercel.app](https://shop-sense-ai-real.vercel.app)

Phone-first comparison app for GitHub Showcase:

- **Gemini mode:** Gemini API (variant-aware offers + AI benchmarks)

It provides:

- Variant selection (brand, model, RAM, storage, budget)
- Offer scraping pipeline (Amazon, Flipkart, Samsung, Motorola, iQOO)
- AI advice + benchmark summary + alternatives in your budget range

## Quick Start

1. Install dependencies:
   - `npm install`
2. Choose an env file and copy to `.env`:
   - `.env.gemini.example` for showcase mode
3. Start frontend:
   - `npm run dev`
4. Start backend:
   - showcase (Gemini): `npm run start:showcase`

## Gemini Mode

- Set `GEMINI_API_KEY` (or pooled `GEMINI_API_KEYS`) in `.env`.
- Optional pool controls:
  - `GEMINI_MAX_AGENTS`
  - `GEMINI_MAX_PER_KEY`

## API Endpoints

- `GET /api/health`
- `POST /api/phone/advice`
- `POST /api/analyze` (legacy generic product advisor)
- `POST /api/analyze/batch`

## Deploy on Vercel

1. Connect the GitHub repo: [ShopSenseAi](https://github.com/adadaabhay/ShopSenseAi). Live site: [shop-sense-ai-real.vercel.app](https://shop-sense-ai-real.vercel.app).
2. **Framework preset:** Other (custom Express + Vite bundle).
3. **Build Command:** `npm run build` or `npm run vercel-build` (both run `vite build` so `dist/` exists for `express.static`).
4. **Output directory:** leave **empty** — the app serves `dist/` from Express, not Vercel static output.
5. **Install Command:** `npm install` (CI uses `npm ci` with `package-lock.json`).
6. **Environment variables** (production `/api/*`):
   - `AI_PROVIDER=gemini`
   - `GEMINI_API_KEY` (or `GEMINI_API_KEYS` for pooling)
   - Optional: `GEMINI_MODEL`, `GEMINI_MAX_AGENTS`, `GEMINI_MAX_PER_KEY`, `GEMINI_MAX_OUTPUT_TOKENS`, `GEMINI_TEMPERATURE`
7. **Price trends:** on Vercel, history is **in-memory** per instance (cold starts reset).

## CI

Pushes to `main` / `master` run **lint + build** (`.github/workflows/ci.yml`).

## Notes on Live Prices

- Prices are scraped best-effort from search pages and can change quickly.
- Some sites render with heavy client-side JS, so accuracy can vary.
- Use this as a smart shortlist, then verify final checkout page before purchase.
