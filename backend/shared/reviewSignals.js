import * as cheerio from 'cheerio';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const REVIEW_SOURCES = [
  {
    name: 'GSMArena',
    weight: 1.1,
    categories: ['phone', 'tablet', 'smartwatch'],
    buildSearchUrl: (q) => `https://www.gsmarena.com/results.php3?sQuickSearch=yes&sName=${encodeURIComponent(q)}`,
  },
  {
    name: 'Notebookcheck',
    weight: 1.15,
    categories: ['laptop', 'tablet', 'monitor'],
    buildSearchUrl: (q) => `https://www.notebookcheck.net/index.php?id=127065&search=${encodeURIComponent(q)}`,
  },
  {
    name: 'Rtings',
    weight: 1.2,
    categories: ['tv', 'monitor', 'speaker', 'earbuds', 'headphones'],
    buildSearchUrl: (q) => `https://www.rtings.com/search?q=${encodeURIComponent(q)}`,
  },
  {
    name: 'SoundGuys',
    weight: 1.05,
    categories: ['earbuds', 'speaker', 'headphones'],
    buildSearchUrl: (q) => `https://www.soundguys.com/?s=${encodeURIComponent(q)}`,
  },
  {
    name: 'DPReview',
    weight: 1.2,
    categories: ['camera', 'lens'],
    buildSearchUrl: (q) => `https://www.dpreview.com/search?query=${encodeURIComponent(q)}`,
  },
  {
    name: 'IGN',
    weight: 1.0,
    categories: ['console'],
    buildSearchUrl: (q) => `https://www.ign.com/search?q=${encodeURIComponent(q)}`,
  },
  {
    name: 'PCMag',
    weight: 1.1,
    categories: ['desktop', 'laptop', 'monitor', 'router', 'gpu'],
    buildSearchUrl: (q) => `https://www.pcmag.com/search?q=${encodeURIComponent(q)}`,
  },
  {
    name: 'TomsHardware',
    weight: 1.1,
    categories: ['desktop', 'gpu'],
    buildSearchUrl: (q) => `https://www.tomshardware.com/search?searchTerm=${encodeURIComponent(q)}`,
  },
  {
    name: 'TechRadar',
    weight: 1.05,
    categories: ['phone', 'laptop', 'tablet', 'tv', 'earbuds', 'headphones', 'smartwatch', 'camera', 'console', 'router', 'desktop', 'gpu', 'monitor', 'speaker'],
    buildSearchUrl: (q) => `https://www.techradar.com/search?searchTerm=${encodeURIComponent(q)}`,
  }
];

function clamp10(value) {
  if (!Number.isFinite(value)) return null;
  return Math.max(0, Math.min(10, Math.round(value * 10) / 10));
}

function normalizeScore(raw, best) {
  if (!Number.isFinite(raw) || raw <= 0) return null;
  if (Number.isFinite(best) && best > 0) {
    return clamp10((raw / best) * 10);
  }
  if (raw <= 5) return clamp10(raw * 2);
  if (raw <= 10) return clamp10(raw);
  if (raw <= 100) return clamp10(raw / 10);
  return null;
}

function parseJsonCandidate(text) {
  try {
    const parsed = JSON.parse(text);
    const blocks = Array.isArray(parsed) ? parsed : [parsed];
    const scores = [];

    for (const block of blocks) {
      if (!block || typeof block !== 'object') continue;
      const aggregate = block.aggregateRating || block.reviewRating || block;
      if (!aggregate || typeof aggregate !== 'object') continue;

      const raw = Number(aggregate.ratingValue ?? aggregate.rating ?? aggregate.value);
      const best = Number(aggregate.bestRating ?? aggregate.ratingScaleMax);
      const score10 = normalizeScore(raw, Number.isFinite(best) ? best : undefined);
      if (score10 != null) {
        scores.push({ score10, evidenceType: 'jsonld' });
      }
    }
    return scores;
  } catch {
    return [];
  }
}

function parseRatingSignals(html) {
  const $ = cheerio.load(html);
  const ratings = [];

  $('script[type="application/ld+json"]').each((_, node) => {
    const text = $(node).contents().text();
    const parsed = parseJsonCandidate(text);
    for (const row of parsed) ratings.push(row);
  });

  $('[itemprop="ratingValue"]').each((_, node) => {
    const raw = Number($(node).attr('content') || $(node).text());
    const bestRaw = $(node).closest('[itemprop="aggregateRating"]').find('[itemprop="bestRating"]').attr('content');
    const best = Number(bestRaw);
    const score10 = normalizeScore(raw, Number.isFinite(best) ? best : undefined);
    if (score10 != null) ratings.push({ score10, evidenceType: 'meta' });
  });

  return ratings;
}

async function fetchHtml(url, timeoutMs = 7000) {
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

function average(values) {
  if (!values.length) return null;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / values.length) * 10) / 10;
}

export async function fetchReviewSignals({ brand, model, category }) {
  const query = `${brand || ''} ${model || ''}`.trim();
  if (!query) {
    return { averageScore10: null, verifiedCount: 0, signals: [] };
  }

  const sources = REVIEW_SOURCES.filter((source) => source.categories.includes(category));
  if (sources.length === 0) return { averageScore10: null, verifiedCount: 0, signals: [] };

  const tasks = sources.map(async (source) => {
    if (!source) return null;
    const url = source.buildSearchUrl(query);
    const html = await fetchHtml(url);
    if (!html || html.length < 250) return null;

    const rows = parseRatingSignals(html);
    const structured = rows.filter((r) => r.evidenceType === 'jsonld' || r.evidenceType === 'meta');
    if (!structured.length) return null;
    const score10 = average(structured.map((r) => r.score10));
    if (score10 == null) return null;

    return {
      source: source.name,
      url,
      weight: source.weight,
      score10,
      evidenceType: 'structured',
      verified: true,
    };
  });

  const settled = await Promise.all(tasks);
  const signals = settled.filter(Boolean);

  if (!signals.length) {
    return { averageScore10: null, verifiedCount: 0, signals: [] };
  }

  const weightedTotal = signals.reduce((acc, s) => acc + s.score10 * s.weight, 0);
  const weightSum = signals.reduce((acc, s) => acc + s.weight, 0);
  const averageScore10 = weightSum > 0 ? Math.round((weightedTotal / weightSum) * 10) / 10 : null;

  return {
    averageScore10,
    verifiedCount: signals.filter((s) => s.verified).length,
    signals,
  };
}
