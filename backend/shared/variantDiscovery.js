/**
 * Variant Discovery — Phase 1 of the two-phase search.
 *
 * Given a brand + model + category, scrapes all relevant sources and
 * extracts every unique variant (RAM/storage combo for phones/tablets,
 * RAM/storage/processor for laptops) along with price ranges.
 */

import * as cheerio from 'cheerio';
import { getSourcesForCategory } from './sourceRegistry.js';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const DISCOVERY_CACHE_TTL_MS = 8 * 60 * 1000; // 8 minutes
const discoveryCache = new Map();

// ── Variant extraction helpers ─────────────────────────────────────────

function extractPhoneVariants(text) {
  const results = [];
  // Match patterns like "8GB RAM 256GB", "8 GB / 128 GB", "12GB+256GB"
  const combos = text.matchAll(
    /(\d{1,2})\s*GB\s*(?:RAM)?[\s/+,·|]*(\d{2,4})\s*GB(?!\s*RAM)/gi,
  );
  for (const m of combos) {
    results.push({ ram: `${m[1]}GB`, storage: `${m[2]}GB` });
  }
  // Also try TB storage
  const tbCombos = text.matchAll(
    /(\d{1,2})\s*GB\s*(?:RAM)?[\s/+,·|]*(\d(?:\.\d+)?)\s*TB/gi,
  );
  for (const m of tbCombos) {
    results.push({ ram: `${m[1]}GB`, storage: `${m[2]}TB` });
  }
  return results;
}

function extractLaptopVariants(text) {
  const results = [];
  // Try to find processor mentions near RAM/storage
  const procMatch = text.match(
    /(?:Intel\s+Core\s+)?i[3579][-\s]?\d{4,5}\w*|Ryzen\s+[3579]\s+\d{4}\w*|M[1-4]\s*(?:Pro|Max|Ultra)?|Snapdragon\s+\w+/gi,
  );
  const processor = procMatch ? procMatch[0].trim() : null;

  // RAM can be larger for laptops: 8, 16, 32, 64
  const ramMatches = text.matchAll(/(\d{1,2})\s*GB\s*(?:RAM|DDR|LPDDR)/gi);
  const storageMatches = text.matchAll(
    /(\d{3,4})\s*GB\s*(?:SSD|NVMe|storage|ROM)|(\d(?:\.\d+)?)\s*TB\s*(?:SSD|NVMe|storage|HDD)?/gi,
  );

  const rams = [];
  for (const m of ramMatches) rams.push(`${m[1]}GB`);
  const storages = [];
  for (const m of storageMatches) {
    if (m[1]) storages.push(`${m[1]}GB`);
    else if (m[2]) storages.push(`${m[2]}TB`);
  }

  // Also try simpler pattern: "16GB / 512GB"
  const simpleCombos = text.matchAll(
    /(\d{1,2})\s*GB[\s/+,·|]+(\d{3,4})\s*GB/gi,
  );
  for (const m of simpleCombos) {
    results.push({
      ram: `${m[1]}GB`,
      storage: `${m[2]}GB`,
      processor,
    });
  }

  // Combine extracted RAMs and storages
  if (rams.length && storages.length) {
    for (const r of rams) {
      for (const s of storages) {
        const exists = results.some((v) => v.ram === r && v.storage === s);
        if (!exists) results.push({ ram: r, storage: s, processor });
      }
    }
  }

  return results;
}

function extractVariants(text, category) {
  if (category === 'laptop') return extractLaptopVariants(text);
  return extractPhoneVariants(text);
}

// ── Price extraction ───────────────────────────────────────────────────

function parseRupeeValues(text) {
  const matches = text.match(/₹\s?[\d,]{4,}/g) || [];
  return matches
    .map((v) => Number(v.replace(/[^\d]/g, '')))
    .filter((v) => Number.isFinite(v) && v > 0);
}

// ── HTML scraper for discovery ─────────────────────────────────────────

function discoverFromHtml({ html, sourceName, sourceKind, query, category }) {
  const $ = cheerio.load(html);
  const results = [];
  const blocks = $('a, article, div[class*="product"], div[class*="item"], li[class*="product"]')
    .toArray()
    .slice(0, 400);

  const queryWord = query.toLowerCase().split(' ')[0];

  for (const node of blocks) {
    const text = $(node).text().replace(/\s+/g, ' ').trim();
    if (!text || text.length < 25) continue;
    if (!text.toLowerCase().includes(queryWord)) continue;

    const variants = extractVariants(text, category);
    const prices = parseRupeeValues(text);
    const minPrice = prices.length ? Math.min(...prices) : null;
    const maxPrice = prices.length ? Math.max(...prices) : null;

    for (const v of variants) {
      results.push({
        ram: v.ram,
        storage: v.storage,
        processor: v.processor || null,
        priceValue: minPrice,
        maxPriceValue: maxPrice,
        source: sourceName,
        sourceKind,
      });
    }
  }

  return results;
}

// ── Network fetch with aggressive timeout ──────────────────────────────

async function fetchWithTimeout(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
      signal: controller.signal,
    });
    if (!res.ok) return '';
    return await res.text();
  } catch {
    return '';
  } finally {
    clearTimeout(timeout);
  }
}

// ── Main discovery function ────────────────────────────────────────────

function buildCacheKey(brand, model, category) {
  return `discover|${category}|${brand}|${model}`.toLowerCase().slice(0, 240);
}

function deduplicateVariants(raw) {
  const map = new Map();

  for (const entry of raw) {
    const key = `${(entry.ram || '').toUpperCase()}|${(entry.storage || '').toUpperCase()}|${(entry.processor || '').toUpperCase()}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        ram: entry.ram,
        storage: entry.storage,
        processor: entry.processor || null,
        prices: entry.priceValue ? [entry.priceValue] : [],
        maxPrices: entry.maxPriceValue ? [entry.maxPriceValue] : [],
        sources: new Set([entry.source]),
      });
    } else {
      if (entry.priceValue) existing.prices.push(entry.priceValue);
      if (entry.maxPriceValue) existing.maxPrices.push(entry.maxPriceValue);
      existing.sources.add(entry.source);
    }
  }

  return [...map.values()]
    .map((v) => ({
      ram: v.ram,
      storage: v.storage,
      processor: v.processor,
      priceRange: {
        min: v.prices.length ? Math.min(...v.prices) : null,
        max: v.maxPrices.length ? Math.max(...v.maxPrices) : (v.prices.length ? Math.max(...v.prices) : null),
      },
      sourceCount: v.sources.size,
      sources: [...v.sources],
    }))
    .sort((a, b) => {
      // Sort by RAM then storage numerically
      const ra = parseInt(a.ram) || 0;
      const rb = parseInt(b.ram) || 0;
      if (ra !== rb) return ra - rb;
      const sa = parseInt(a.storage) || 0;
      const sb = parseInt(b.storage) || 0;
      return sa - sb;
    });
}

/**
 * Discover available variants for a product.
 * @param {{ brand: string, model: string, category?: 'phone'|'laptop'|'tablet' }} params
 */
export async function discoverVariants({ brand, model, category = 'phone' }) {
  const query = `${brand} ${model}`.trim();
  const cacheKey = buildCacheKey(brand, model, category);

  const cached = discoveryCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const sources = getSourcesForCategory(category);

  // Scrape all sources in parallel with aggressive individual timeouts
  const tasks = sources.map(async (source) => {
    const url = source.buildSearchUrl(query);
    const html = await fetchWithTimeout(url, 5000);
    if (!html || html.length < 200) return [];
    return discoverFromHtml({
      html,
      sourceName: source.name,
      sourceKind: source.kind,
      query,
      category,
    });
  });

  // Global timeout: 12 seconds max for the entire discovery
  const settled = await Promise.race([
    Promise.all(tasks),
    new Promise((resolve) =>
      setTimeout(() => resolve(tasks.map(() => [])), 12000),
    ),
  ]);

  const raw = settled.flat();
  const variants = deduplicateVariants(raw);
  const sourcesUsed = [...new Set(raw.map((r) => r.source))];

  const result = {
    query,
    category,
    variants,
    sources: sourcesUsed,
    totalSourcesTried: sources.length,
    fetchedAt: new Date().toISOString(),
  };

  discoveryCache.set(cacheKey, {
    expiresAt: Date.now() + DISCOVERY_CACHE_TTL_MS,
    value: result,
  });

  return result;
}
