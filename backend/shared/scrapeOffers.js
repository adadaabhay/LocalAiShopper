import * as cheerio from 'cheerio';
import { getSourcesForCategory } from './sourceRegistry.js';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const offerCache = new Map(); // key -> { expiresAt, value }

function buildCacheKey(sourceName, query) {
  return `${sourceName}|${query}`.slice(0, 240);
}

function parseRupeeValues(text) {
  const matches = text.match(/₹\s?[\d,]{4,}/g) || [];
  return matches
    .map((value) => Number(value.replace(/[^\d]/g, '')))
    .filter((value) => Number.isFinite(value) && value > 0);
}

function extractPhoneVariant(text) {
  const ramMatch = text.match(/(\d{1,2})\s?gb\s?ram/i);
  const tbMatch = text.match(/(\d(?:\.\d+)?)\s?tb/i);
  const storageGbMatch =
    text.match(/(\d{2,4})\s?gb(?!\s?ram)/i) || text.match(/(\d{2,4})\s?gb\s?(?:rom|storage)/i);

  const ram = ramMatch ? `${ramMatch[1]}GB` : null;
  let storage = null;
  if (tbMatch) {
    storage = `${tbMatch[1]}TB`;
  } else if (storageGbMatch) {
    storage = `${storageGbMatch[1]}GB`;
  }
  return { ram, storage, processor: null };
}

function extractLaptopVariant(text) {
  const ramMatch =
    text.match(/(\d{1,2})\s?gb\s?(?:ram|ddr|lpddr)/i) ||
    text.match(/(\d{1,2})\s?gb/i);
  const tbMatch = text.match(/(\d(?:\.\d+)?)\s?tb\s?(?:ssd|nvme|hdd|storage)?/i);
  const storageGbMatch =
    text.match(/(\d{3,4})\s?gb\s?(?:ssd|nvme|storage)/i) ||
    text.match(/(\d{3,4})\s?gb(?!\s?ram)/i);
  const procMatch = text.match(
    /(?:Intel\s+Core\s+)?i[3579][-\s]?\d{4,5}\w*|Ryzen\s+[3579]\s+\d{4}\w*|M[1-4]\s*(?:Pro|Max|Ultra)?|Snapdragon\s+\w+/i,
  );

  const ram = ramMatch ? `${ramMatch[1]}GB` : null;
  let storage = null;
  if (tbMatch) {
    storage = `${tbMatch[1]}TB`;
  } else if (storageGbMatch) {
    storage = `${storageGbMatch[1]}GB`;
  }
  const processor = procMatch ? procMatch[0].trim() : null;
  return { ram, storage, processor };
}

function extractVariant(text, category) {
  if (category === 'laptop') return extractLaptopVariant(text);
  return extractPhoneVariant(text);
}

function cleanText(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function parseOffersFromHtml({ html, url, sourceName, sourceKind, query, category }) {
  const $ = cheerio.load(html);
  const candidates = [];
  const blocks = $('a, article').toArray().slice(0, 320);

  for (const node of blocks) {
    const text = cleanText($(node).text());
    if (!text || text.length < 30) {
      continue;
    }
    const lower = text.toLowerCase();
    if (!lower.includes(query.toLowerCase().split(' ')[0])) {
      continue;
    }

    if (!text.includes('₹')) {
      continue;
    }

    const prices = parseRupeeValues(text);
    if (prices.length === 0) {
      continue;
    }

    const href =
      $(node).attr('href') ||
      $(node)
        .find('a')
        .first()
        .attr('href');
    const firstPrice = Math.min(...prices);
    const { ram, storage, processor } = extractVariant(text, category);
    const trustScore = sourceKind === 'official' ? 0.9 : 0.65;
    const trustWeight = sourceKind === 'official' ? 0 : 1;
    candidates.push({
      store: sourceName,
      sourceType: sourceKind,
      title: text.slice(0, 160),
      priceValue: firstPrice,
      priceLabel: `Rs. ${firstPrice.toLocaleString('en-IN')}`,
      ram: ram ?? 'Unknown',
      storage: storage ?? 'Unknown',
      processor: processor ?? null,
      url: href ? new URL(href, url).toString() : url,
      confidence: sourceKind === 'official' ? 'medium' : 'high',
      trustScore,
      trustWeight,
      freshness: 'live-ish',
    });
  }

  return candidates
    .sort((a, b) => a.priceValue - b.priceValue)
    .slice(0, 5);
}

async function fetchSourceOffers(source, query, category) {
  const url = source.buildSearchUrl(query);

  const cacheKey = buildCacheKey(source.name, query);
  const cached = offerCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      return [];
    }
    const html = await response.text();
    const value = parseOffersFromHtml({
      html,
      url,
      sourceName: source.name,
      sourceKind: source.kind,
      query,
      category,
    });
    offerCache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, value });
    return value;
  } catch {
    return [];
  }
}

function uniqueByTitleAndPrice(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.store}|${item.priceValue}|${item.title.slice(0, 40)}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Scrape offers for a product query.
 * @param {string} query — full search string
 * @param {'phone'|'laptop'|'tablet'} [category='phone'] — product category
 */
export async function scrapePhoneOffers(query, category = 'phone') {
  const sources = getSourcesForCategory(category);
  const tasks = sources.map((source) => fetchSourceOffers(source, query, category));
  const settled = await Promise.all(tasks);
  const offers = uniqueByTitleAndPrice(settled.flat())
    .sort((a, b) => a.priceValue - b.priceValue)
    .slice(0, 12);

  return {
    query,
    category,
    fetchedAt: new Date().toISOString(),
    sourcesTried: sources.map((source) => source.name),
    offers,
  };
}
