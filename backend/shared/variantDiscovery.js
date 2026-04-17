/**
 * Variant Discovery - Phase 1 of the two-phase search.
 *
 * Given a brand + model + category, scrapes all relevant sources and
 * extracts every unique variant (RAM/storage combo for phones/tablets,
 * RAM/storage/processor for laptops) along with price ranges.
 */

import * as cheerio from 'cheerio';
import { getSourcesForCategory } from './sourceRegistry.js';
import { fetchWithBrowser } from './browserCache.js';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const DISCOVERY_CACHE_TTL_MS = 8 * 60 * 1000; // 8 minutes
const discoveryCache = new Map();
const STOP_TOKENS = new Set([
  '5g', '4g', 'wifi', 'with', 'and', 'plus', 'pro', 'max', 'ultra', 'new', 'latest',
  'gb', 'tb', 'ram', 'storage', 'rom', 'dual', 'sim', 'in', 'for',
]);

function extractNodeText($, node) {
  const parts = [
    $(node).text(),
    $(node).attr('title'),
    $(node).attr('aria-label'),
    $(node).find('[title]').map((_, el) => $(el).attr('title')).get().join(' '),
    $(node).find('[aria-label]').map((_, el) => $(el).attr('aria-label')).get().join(' '),
    $(node).find('img[alt]').map((_, el) => $(el).attr('alt')).get().join(' '),
  ];

  return parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

function minimumExpectedPrice(category) {
  const map = {
    phone: 6000,
    laptop: 20000,
    tablet: 8000,
    smartwatch: 1200,
    earbuds: 400,
    headphones: 700,
    tv: 7000,
    camera: 12000,
    monitor: 5000,
    speaker: 600,
    console: 15000,
    desktop: 18000,
    gpu: 7000,
    router: 900,
  };
  return map[category] || 500;
}

function tokenizeQuery(query) {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOP_TOKENS.has(t));
}

function hasStrongTokenMatch(text, queryTokens) {
  if (queryTokens.length === 0) return true;
  const lower = text.toLowerCase();
  const matches = queryTokens.filter((token) => lower.includes(token));
  const required = Math.max(1, Math.ceil(queryTokens.length * 0.5));
  return matches.length >= required;
}

function extractPhoneVariants(text) {
  const results = [];
  const combos = text.matchAll(
    /(?<!\d)(\d{1,2})\s*GB\s*(?:RAM)?[\s/+,.|-]*(?<!\d)(\d{2,4})\s*GB(?!\s*RAM)/gi,
  );
  for (const m of combos) {
    results.push({ ram: `${m[1]}GB`, storage: `${m[2]}GB` });
  }

  const tbCombos = text.matchAll(
    /(?<!\d)(\d{1,2})\s*GB\s*(?:RAM)?[\s/+,.|-]*(?<!\d)(\d(?:\.\d+)?)\s*TB/gi,
  );
  for (const m of tbCombos) {
    results.push({ ram: `${m[1]}GB`, storage: `${m[2]}TB` });
  }

  if (results.length === 0) {
    const storageValues = new Set();
    const storageCombos = text.matchAll(/(?<!\d)(\d{3,4})\s*GB(?!\s*RAM)/gi);
    for (const m of storageCombos) {
      storageValues.add(`${m[1]}GB`);
    }
    const tbOnly = text.matchAll(/(?<!\d)(\d(?:\.\d+)?)\s*TB/gi);
    for (const m of tbOnly) {
      storageValues.add(`${m[1]}TB`);
    }

    if (storageValues.size === 1) {
      results.push({ ram: 'Unknown', storage: [...storageValues][0] });
    }
  }

  if (results.length === 0) {
    results.push({ ram: 'Unknown', storage: 'Unknown' });
  }
  return results;
}

function extractLaptopVariants(text) {
  const results = [];
  const procMatch = text.match(
    /(?:Intel\s+Core\s+)?i[3579][-\s]?\d{4,5}\w*|Ryzen\s+[3579]\s+\d{4}\w*|Snapdragon\s+\w+/gi,
  );
  const processor = procMatch ? procMatch[0].trim() : null;

  const simpleCombos = text.matchAll(
    /(?<!\d)(\d{1,2})\s*GB[\s/+,.|-]+(?<!\d)(\d{3,4})\s*GB/gi,
  );
  for (const m of simpleCombos) {
    results.push({
      ram: `${m[1]}GB`,
      storage: `${m[2]}GB`,
      processor,
    });
  }

  const tbCombos = text.matchAll(
    /(?<!\d)(\d{1,2})\s*GB[\s/+,.|-]+(?<!\d)(\d(?:\.\d+)?)\s*TB/gi,
  );
  for (const m of tbCombos) {
    results.push({
      ram: `${m[1]}GB`,
      storage: `${m[2]}TB`,
      processor,
    });
  }

  if (results.length === 0) {
    const ramValues = [...text.matchAll(/(?<!\d)(\d{1,2})\s*GB\s*(?:RAM|DDR|LPDDR)/gi)].map((m) => `${m[1]}GB`);
    const storageValues = [...text.matchAll(
      /(?<!\d)(\d{3,4})\s*GB\s*(?:SSD|NVMe|storage|ROM)|(?<!\d)(\d(?:\.\d+)?)\s*TB\s*(?:SSD|NVMe|storage|HDD)?/gi,
    )].map((m) => (m[1] ? `${m[1]}GB` : `${m[2]}TB`));

    const uniqueRams = [...new Set(ramValues)];
    const uniqueStorages = [...new Set(storageValues)];

    if (uniqueRams.length === 1 && uniqueStorages.length === 1) {
      results.push({
        ram: uniqueRams[0],
        storage: uniqueStorages[0],
        processor,
      });
    }
  }

  if (results.length === 0 && processor) {
    results.push({ ram: 'Unknown', storage: 'Unknown', processor });
  }

  return results;
}

function extractGenericVariants(text) {
  const tb = text.match(/(?<!\d)(\d(?:\.\d+)?)\s*TB/gi);
  const gb = text.match(/(?<!\d)(\d{2,4})\s*GB/gi);
  const perf = text.match(/RTX\s?\d{3,4}|RX\s?\d{3,4}|M\d|H\d|U\d|XR|X1|Snapdragon/gi);

  const capacity = tb?.[0] || gb?.[0] || 'Unknown';
  return [
    {
      ram: 'Unknown',
      storage: capacity.replace(/\s+/g, ''),
      processor: perf?.[0] || null,
    },
  ];
}

function extractVariants(text, category) {
  if (category === 'laptop') return extractLaptopVariants(text);
  if (category !== 'phone' && category !== 'tablet' && category !== 'smartwatch') {
    return extractGenericVariants(text);
  }
  return extractPhoneVariants(text);
}

function parseRupeeValues(text) {
  const matches = text.match(/(?:Rs\.?|INR|\u20B9)\s?[\d,]{3,}/gi) || [];
  return matches
    .map((v) => Number(v.replace(/[^\d]/g, '')))
    .filter((v) => Number.isFinite(v) && v > 0);
}

function discoverFromHtml({ html, sourceName, sourceKind, query, category, sourceSearchUrl }) {
  const $ = cheerio.load(html);
  const results = [];
  const blocks = $('a, article, div[class*="product"], div[class*="item"], li[class*="product"]')
    .toArray()
    .slice(0, 400);

  const minExpectedPrice = minimumExpectedPrice(category);
  const queryTokens = tokenizeQuery(query);
  const words = query.toLowerCase().split(' ');
  const brandFirstWord = words[0];
  const modelQuery = words.length > 1 ? words.slice(1).join(' ') : query.toLowerCase();
  const modelFirstWord = modelQuery.split(' ')[0];
  const accessoryKeywords = [
    'case', 'cover', 'charger', 'cable', 'tempered', 'protector', 'adapter', 'skin', 'stand',
    'compatible with', 'for iphone', 'for samsung', 'for oneplus', 'for vivo', 'for oppo', 'back cover',
  ];

  for (const node of blocks) {
    const text = extractNodeText($, node);
    if (!text || text.length < 15) continue;

    const lower = text.toLowerCase();
    if (!lower.includes(modelFirstWord)) continue;
    if (brandFirstWord && !lower.includes(brandFirstWord)) continue;
    if (accessoryKeywords.some((keyword) => lower.includes(keyword))) continue;
    if (!hasStrongTokenMatch(lower, queryTokens)) continue;

    const variants = extractVariants(text, category);
    const prices = parseRupeeValues(text);
    if (!prices.length) continue;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    if (maxPrice < minExpectedPrice) continue;

    for (const v of variants) {
      const href =
        $(node).attr('href') ||
        $(node)
          .find('a')
          .first()
          .attr('href');
      let resolvedUrl = null;
      try {
        resolvedUrl = href ? new URL(href, sourceSearchUrl).toString() : null;
      } catch {
        resolvedUrl = null;
      }

      results.push({
        ram: v.ram || 'Unknown',
        storage: v.storage,
        processor: v.processor || null,
        priceValue: minPrice,
        maxPriceValue: maxPrice,
        source: sourceName,
        sourceKind,
        url: resolvedUrl,
      });
    }
  }

  return results;
}

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

async function fetchWithPlaywright(url, timeoutMs = 15000) {
  const html = await fetchWithBrowser(url, timeoutMs);
  return html || await fetchWithTimeout(url, 5000);
}

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
        url: entry.url || null,
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
      url: v.url || null,
      priceRange: {
        min: v.prices.length ? Math.min(...v.prices) : null,
        max: v.maxPrices.length ? Math.max(...v.maxPrices) : (v.prices.length ? Math.max(...v.prices) : null),
      },
      sourceCount: v.sources.size,
      sources: [...v.sources],
    }))
    .sort((a, b) => {
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

  const sources = getSourcesForCategory(category, brand, model);

  console.log(`[Discovery] Searching ${sources.length} sources for "${query}" (${category}): ${sources.map((s) => s.name).join(', ')}`);

  const tasks = sources.map(async (source) => {
    const url = source.buildSearchUrl(query);
    const html = source.kind === 'official'
      ? await fetchWithPlaywright(url, 20000)
      : await fetchWithTimeout(url, 6000);

    if (!html || html.length < 200) {
      console.log(`[Discovery] ${source.name}: No usable HTML (${html?.length || 0} bytes)`);
      return [];
    }
    const found = discoverFromHtml({
      html,
      sourceName: source.name,
      sourceKind: source.kind,
      query,
      category,
      sourceSearchUrl: url,
    });
    console.log(`[Discovery] ${source.name}: Found ${found.length} raw entries`);
    return found;
  });

  const settled = await Promise.race([
    Promise.all(tasks),
    new Promise((resolve) =>
      setTimeout(() => resolve(tasks.map(() => [])), 30000),
    ),
  ]);

  const raw = settled.flat();
  let variants = deduplicateVariants(raw);

  const isMobile = category === 'phone' || category === 'tablet' || category === 'smartwatch';
  if (isMobile) {
    variants = variants.filter((v) => {
      const storage = (v.storage || '').toUpperCase();
      if (storage === 'UNKNOWN') return true;
      if (storage.endsWith('TB')) {
        const tb = Number.parseFloat(storage);
        return Number.isFinite(tb) && tb <= 1;
      }
      if (storage.endsWith('GB')) {
        const gb = Number.parseInt(storage, 10);
        return Number.isFinite(gb) && gb >= 32 && gb <= 1024;
      }
      return false;
    });

    const knownStorage = variants.filter((v) => v.storage && v.storage !== 'Unknown');
    if (knownStorage.length > 0) {
      variants = knownStorage;
    }
  }

  const sourcesUsed = [...new Set(raw.map((r) => r.source))];

  const result = {
    query,
    category,
    variants,
    sources: sourcesUsed,
    sourcesTried: sources.map((s) => s.name),
    totalSourcesTried: sources.length,
    fetchedAt: new Date().toISOString(),
  };

  discoveryCache.set(cacheKey, {
    expiresAt: Date.now() + DISCOVERY_CACHE_TTL_MS,
    value: result,
  });

  return result;
}

