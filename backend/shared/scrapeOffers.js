import * as cheerio from 'cheerio';
import { getSourcesForCategory } from './sourceRegistry.js';
import { fetchWithBrowser } from './browserCache.js';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const offerCache = new Map(); // key -> { expiresAt, value }
const STOP_TOKENS = new Set([
  '5g', '4g', 'wifi', 'with', 'and', 'plus', 'pro', 'max', 'ultra', 'new', 'latest',
  'gb', 'tb', 'ram', 'storage', 'rom', 'dual', 'sim', 'in', 'for',
]);

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

function buildCacheKey(sourceName, query) {
  return `${sourceName}|${query}`.slice(0, 240);
}

function parseRupeeValues(text) {
  const matches = text.match(/(?:Rs\.?|INR|₹)\s?[\d,]{3,}/gi) || [];
  return matches
    .map((value) => Number(value.replace(/[^\d]/g, '')))
    .filter((value) => Number.isFinite(value) && value > 0);
}

function parsePriceNumber(value) {
  if (value == null) return null;
  const cleaned = String(value).replace(/[^0-9.]/g, '');
  if (!cleaned) return null;
  const numeric = Number(cleaned.includes('.') ? Number.parseFloat(cleaned) : Number.parseInt(cleaned, 10));
  return Number.isFinite(numeric) ? Math.round(numeric) : null;
}

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2) return sorted[mid];
  return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function extractStructuredPrices({ html, $, url }) {
  const candidates = [];

  const metaValues = [
    $('meta[property="product:price:amount"]').attr('content'),
    $('meta[property="og:price:amount"]').attr('content'),
    $('meta[name="twitter:data1"]').attr('content'),
    $('meta[name="price"]').attr('content'),
  ];

  for (const raw of metaValues) {
    const num = parsePriceNumber(raw);
    if (num) candidates.push(num);
  }

  const host = (() => {
    try {
      return new URL(url).hostname.toLowerCase();
    } catch {
      return '';
    }
  })();

  if (host.includes('amazon.')) {
    const offscreen = $('#corePrice_feature_div .a-price .a-offscreen').first().text();
    const offscreenNum = parsePriceNumber(offscreen);
    if (offscreenNum) candidates.push(offscreenNum);

    const amazonPatterns = [
      /"priceToPay"\s*:\s*\{\s*"price"\s*:\s*([0-9]+(?:\.[0-9]+)?)/i,
      /"displayPrice"\s*:\s*"₹\s*([\d,]+)"/i,
      /"amount"\s*:\s*"₹\s*([\d,]+)"/i,
    ];
    for (const pattern of amazonPatterns) {
      const match = html.match(pattern);
      const num = parsePriceNumber(match?.[1]);
      if (num) candidates.push(num);
    }
  }

  if (host.includes('flipkart.')) {
    const flipPatterns = [
      /"finalPrice"\s*:\s*\{\s*"value"\s*:\s*(\d+)/i,
      /"sellingPrice"\s*:\s*\{\s*"value"\s*:\s*(\d+)/i,
      /"price"\s*:\s*"₹\s*([\d,]+)"/i,
    ];
    for (const pattern of flipPatterns) {
      const match = html.match(pattern);
      const num = parsePriceNumber(match?.[1]);
      if (num) candidates.push(num);
    }
  }

  return candidates.filter((n) => Number.isFinite(n) && n >= 500);
}

function extractPhoneVariant(text) {
  const ramMatch = text.match(/(?<!\d)(\d{1,2})\s?gb\s?ram/i);
  const tbMatch = text.match(/(?<!\d)(\d(?:\.\d+)?)\s?tb/i);
  const storageGbMatch =
    text.match(/(?<!\d)(\d{2,4})\s?gb(?!\s?ram)/i) || text.match(/(?<!\d)(\d{2,4})\s?gb\s?(?:rom|storage)/i);

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
    text.match(/(?<!\d)(\d{1,2})\s?gb\s?(?:ram|ddr|lpddr)/i) ||
    text.match(/(?<!\d)(\d{1,2})\s?gb/i);
  const tbMatch = text.match(/(?<!\d)(\d(?:\.\d+)?)\s?tb\s?(?:ssd|nvme|hdd|storage)?/i);
  const storageGbMatch =
    text.match(/(?<!\d)(\d{3,4})\s?gb\s?(?:ssd|nvme|storage)/i) ||
    text.match(/(?<!\d)(\d{3,4})\s?gb(?!\s?ram)/i);
  const procMatch = text.match(
    /(?:Intel\\s+Core\\s+)?i[3579][-\\s]?\\d{4,5}\\w*|Ryzen\\s+[3579]\\s+\\d{4}\\w*|Snapdragon\\s+\\w+/i,
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

function extractGenericVariant(text) {
  const gbMatch = text.match(/(?<!\d)(\d{1,4})\s?gb/i);
  const tbMatch = text.match(/(?<!\d)(\d(?:\.\d+)?)\s?tb/i);
  
  let genericVal = 'Unknown';
  if (tbMatch) {
    genericVal = `${tbMatch[1]}TB`;
  } else if (gbMatch) {
    genericVal = `${gbMatch[1]}GB`;
  }

  const seriesMatch = text.match(/(?:RTX|Radeon|GTX|RX|Core|Ryzen|M[1234])\s*\d{0,4}\w*/i);
  
  return { 
    ram: genericVal, 
    storage: genericVal, 
    processor: seriesMatch ? seriesMatch[0].trim() : null 
  };
}

function extractVariant(text, category) {
  if (category === 'laptop') return extractLaptopVariant(text);
  if (category === 'phone' || category === 'tablet' || category === 'smartwatch') return extractPhoneVariant(text);
  return extractGenericVariant(text);
}

function cleanText(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function isValidHttpUrl(value) {
  if (!value || typeof value !== 'string') return false;
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function looksLikeProductPath(urlValue) {
  try {
    const u = new URL(urlValue);
    const path = (u.pathname || '').toLowerCase();
    const full = `${path}${u.search}`.toLowerCase();

    if (full.includes('/search') || full.includes('/s?') || full.includes('?q=') || full.includes('&q=')) {
      return false;
    }
    if (path.includes('/dp/') || path.includes('/gp/product/')) return true;
    if (path.includes('/p/')) return true;
    if (path.includes('/product')) return true;
    if (path.includes('/item')) return true;
    return path.split('/').filter(Boolean).length >= 2;
  } catch {
    return false;
  }
}

function resolveProductUrl(baseUrl, href) {
  if (!href) return null;
  try {
    const resolved = new URL(href, baseUrl).toString();
    if (!isValidHttpUrl(resolved)) return null;
    if (!looksLikeProductPath(resolved)) return null;
    return resolved;
  } catch {
    return null;
  }
}

function parseOffersFromHtml({ html, url, sourceName, sourceKind, query, category }) {
  const $ = cheerio.load(html);
  const candidates = [];
  const blocks = $('a, article').toArray().slice(0, 320);

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
    const text = cleanText($(node).text());
    if (!text || text.length < 15) {
      continue;
    }
    const lower = text.toLowerCase();

    if (!lower.includes(modelFirstWord)) {
      continue;
    }
    if (brandFirstWord && !lower.includes(brandFirstWord)) {
      continue;
    }
    if (accessoryKeywords.some((keyword) => lower.includes(keyword))) {
      continue;
    }
    if (!hasStrongTokenMatch(lower, queryTokens)) {
      continue;
    }

    if (!/(Rs\.?|INR)/i.test(text)) {
      continue;
    }

    const prices = parseRupeeValues(text);
    if (prices.length === 0) {
      continue;
    }
    if (Math.max(...prices) < minExpectedPrice) {
      continue;
    }

    const href =
      $(node).attr('href') ||
      $(node)
        .find('a')
        .first()
        .attr('href');
    const productUrl = resolveProductUrl(url, href);
    if (!productUrl) {
      continue;
    }

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
      url: productUrl,
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
    let html = await fetchWithBrowser(url, 15000);
    if (!html) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout));
      if (response.ok) html = await response.text();
    }

    if (!html) return [];

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
  } catch (e) {
    console.warn(`Fetch error for ${source.name}:`, e.message);
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
 * @param {string} query - full search string (e.g. "ASUS TUF F16 16GB 512GB")
 * @param {string} [category='phone'] - product category
 */
export async function scrapePhoneOffers(query, category = 'phone') {
  const words = query.trim().split(/\s+/);
  const brand = words[0] || '';
  const model = words.slice(1, 4).join(' ');

  const sources = getSourcesForCategory(category, brand, model);
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

export async function scrapeDirectOffer(directUrl, category = 'phone') {
  if (!isValidHttpUrl(directUrl)) return null;
  const url = directUrl.trim();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));
    if (!response.ok) return null;
    const html = await response.text();
    if (!html || html.length < 200) return null;

    const $ = cheerio.load(html);
    const title = cleanText(
      $('meta[property="og:title"]').attr('content') ||
        $('h1').first().text() ||
        $('title').first().text() ||
        'Direct product page',
    ).slice(0, 180);

    const pageText = cleanText($('body').text()).slice(0, 8000);
    const structuredPrices = extractStructuredPrices({ html, $, url });
    const textPrices = parseRupeeValues(pageText).filter((n) => n >= 500);
    const firstPrice =
      (structuredPrices.length ? median(structuredPrices) : null) ??
      (textPrices.length ? median(textPrices) : null);
    const { ram, storage, processor } = extractVariant(`${title} ${pageText.slice(0, 700)}`, category);

    return {
      store: 'Direct URL',
      sourceType: 'direct_link',
      title,
      priceValue: firstPrice,
      priceLabel: firstPrice ? `Rs. ${firstPrice.toLocaleString('en-IN')}` : 'Price not detected',
      ram: ram ?? 'Unknown',
      storage: storage ?? 'Unknown',
      processor: processor ?? null,
      url,
      confidence: 'high',
      trustScore: 0.95,
      trustWeight: -2,
      freshness: 'live',
      variantConfirmed: true,
      variantMode: 'unknown',
    };
  } catch {
    return null;
  }
}

