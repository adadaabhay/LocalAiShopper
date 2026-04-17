# LocalAiShopper

LocalAiShopper is a privacy-first shopping intelligence workspace that combines live storefront scraping, variant discovery, local-model analysis, and a React dashboard to help you compare electronics without sending prompts to cloud AI providers.

It is built to run well as a local-first stack:
- `React 19 + Vite` frontend for the dashboard
- `Express` backend for orchestration and API routing
- `LM Studio` or `Ollama` for fully local inference
- `Cheerio + browser-assisted fetching` for live product and pricing extraction
- `GitHub Actions` CI for install, type-check, and production build validation

## What It Does

LocalAiShopper supports a two-phase product analysis pipeline:

1. Variant discovery
   It searches supported retailers and official stores for a product family such as `Samsung Galaxy S24` or `ASUS TUF F16`, then extracts likely RAM, storage, and processor variants from live listing text.
2. Offer analysis
   It fetches matching offers for a specific variant, confirms variant details when possible, calculates price posture, blends heuristic scoring with verified review signals, and asks a local model to generate a structured buying recommendation.

The app is designed for electronics categories such as:
- phones
- laptops
- tablets
- smartwatches
- earbuds
- headphones
- TVs
- cameras
- monitors
- speakers
- consoles
- desktops
- GPUs
- routers

## Pipeline Overview

### 1. Frontend flow

The dashboard lets a user:
- choose a category and product
- open the search workspace
- inspect discovered variants
- run a deeper analysis for a chosen model or variant
- review pricing, alternatives, activity, and trend views

Main frontend entrypoints live in:
- `frontend/src/App.tsx`
- `frontend/src/pages/*`
- `frontend/src/components/*`

### 2. API flow

The backend is initialized in `server.js` and `backend/shared/app.js`.

Important routes:
- `GET /api/health`
  Returns provider, supported categories, and source information.
- `POST /api/discover`
  Phase 1 variant discovery for `brand + model + category`.
- `POST /api/analyze`
  Lightweight product analysis by product name and persona.
- `POST /api/analyze/batch`
  Batch analysis for up to 5 product names.
- `POST /api/phone/advice`
  Main structured recommendation pipeline for a specific product/variant.
- `POST /api/product/advice`
  Alias for backward compatibility.

### 3. Variant discovery

`backend/shared/variantDiscovery.js`:
- builds category-aware search source lists
- fetches retailer HTML
- token-matches listings to avoid unrelated accessories
- extracts variants such as RAM and storage combinations
- filters implausible prices and noisy results
- deduplicates variants across sources
- caches discovery results for a short interval

### 4. Offer scraping and normalization

`backend/shared/scrapeOffers.js`:
- fetches listing pages and direct product pages
- detects rupee-denominated prices
- extracts product URLs
- infers variant information from listing text
- scores source trust and freshness
- returns normalized offers for downstream analysis

### 5. Advice generation

`backend/shared/phoneAdvisor.js` orchestrates the main decision pipeline:
- scrapes offers
- optionally includes a direct product URL
- confirms variant details where possible
- filters the best exact or partial matches
- fetches verified review signals
- computes heuristic scores by category
- blends heuristic and verified-review evidence
- calls the selected local AI provider
- repairs malformed model JSON once if needed
- falls back to deterministic advice when provider output fails
- stores simple price-history trend snapshots

### 6. AI providers

Provider selection happens in `backend/shared/providers/index.js`.

Supported providers:
- `lmstudio`
- `ollama`

The repo is currently wired for local providers only. The old Gemini path has been removed from the active provider selection logic.

## Local Development

### Prerequisites

- Node.js `20+`
- npm
- One local model runtime:
  - LM Studio
  - Ollama

### Install

```bash
git clone https://github.com/adadaabhay/LocalAiShopper.git
cd LocalAiShopper
npm install
```

### Environment

Copy `.env.example` to `.env` and set the provider you want:

```env
PORT=5000
AI_PROVIDER=lmstudio

LMSTUDIO_BASE_URL=http://127.0.0.1:1234/v1
LMSTUDIO_MODEL=local-model
LMSTUDIO_TEMPERATURE=0.1
LMSTUDIO_TIMEOUT_MS=60000

# OLLAMA_BASE_URL=http://127.0.0.1:11434
# OLLAMA_MODEL=qwen2.5-coder
# OLLAMA_TEMPERATURE=0.2
# OLLAMA_TIMEOUT_MS=60000
```

### Run

```bash
npm run dev
```

This starts:
- the Vite frontend
- the Express backend via `npm run start`

Default backend port:
- `5000`

## Build And Checks

Useful commands:

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## CI Pipeline

GitHub Actions workflow:
- `.github/workflows/ci.yml`

Current CI steps:
1. checkout
2. setup Node.js 20 with npm cache
3. `npm ci`
4. `npm run lint`
5. `npm run build`

That means every push or pull request to `main` or `master` gets a basic install, type-check, and production build verification.

## Repository Hygiene

The repo is configured to avoid pushing sensitive or noisy local files:
- `.env` and local env variants are ignored
- logs are ignored
- local scratch test artifacts are ignored
- `dist/` and `node_modules/` are ignored

Tracked project files still include:
- source code
- config
- workflow definitions
- package manifests
- license and README

## Deployment Notes

This project is best when run locally because the AI provider is expected to be available on the same machine.

Important constraints:
- if the backend is deployed remotely, it cannot reach `localhost` on your laptop unless you expose your model server yourself
- scraping reliability depends on the target site and runtime environment
- serverless environments may be a poor fit for browser-heavy scraping flows

The repo contains `vercel.json`, but cloud deployment should be treated as a separate operational setup from the local-first path.

## Tech Stack

- React 19
- Vite 6
- TypeScript
- Express 4
- Framer Motion
- Cheerio
- Playwright dependency for browser-assisted scraping support
- LM Studio
- Ollama

## License

MIT. See [LICENSE](./LICENSE).
