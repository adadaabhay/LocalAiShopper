import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', '..', 'data');
const historyPath = path.join(dataDir, 'price-history.json');

/** In-memory history on Vercel (ephemeral per instance; avoids disk / cold-start surprises). */
const memoryStore = new Map();

function safeReadJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return {};
    const raw = fs.readFileSync(filePath, 'utf-8');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function safeWriteJson(filePath, value) {
  try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf-8');
  } catch {
    // best-effort; ignore persistence failures
  }
}

function keyForVariant({ brand, model, ram, storage }) {
  return `${brand}|${model}|${ram}|${storage}`.toLowerCase().replace(/\s+/g, ' ').trim();
}

function pctChange(a, b) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  if (a === 0) return null;
  return Math.round(((b - a) / a) * 1000) / 10;
}

function buildTrendReturn({ key, next, prev }) {
  const trendBestPct = prev && prev.bestPriceValue ? pctChange(prev.bestPriceValue, next[next.length - 1].bestPriceValue) : null;
  const trendMedianPct =
    prev && prev.medianPriceValue ? pctChange(prev.medianPriceValue, next[next.length - 1].medianPriceValue) : null;

  const direction = (trendBestPct ?? 0) === 0 ? 'stable' : (trendBestPct ?? 0) > 0 ? 'up' : 'down';
  return {
    historyKey: key,
    samples: next.length,
    lastSeenAt: prev?.at ?? null,
    bestTrend: {
      direction,
      pct: trendBestPct,
    },
    medianTrend: {
      direction: (trendMedianPct ?? 0) === 0 ? 'stable' : (trendMedianPct ?? 0) > 0 ? 'up' : 'down',
      pct: trendMedianPct,
    },
  };
}

export function updatePriceHistory({ brand, model, ram, storage, bestPriceValue, medianPriceValue }) {
  const key = keyForVariant({ brand, model, ram, storage });
  const now = new Date();
  const entry = {
    at: now.toISOString(),
    bestPriceValue: bestPriceValue ?? null,
    medianPriceValue: medianPriceValue ?? null,
  };

  if (process.env.VERCEL) {
    const existing = Array.isArray(memoryStore.get(key)) ? memoryStore.get(key) : [];
    const next = [...existing.slice(-49), entry];
    memoryStore.set(key, next);
    const prev = existing.length ? existing[existing.length - 1] : null;
    return {
      ...buildTrendReturn({ key, next, prev }),
      persistence: 'memory',
    };
  }

  const store = safeReadJson(historyPath);
  const existing = Array.isArray(store[key]) ? store[key] : [];
  const next = [...existing.slice(-49), entry];
  const prev = existing.length ? existing[existing.length - 1] : null;
  safeWriteJson(historyPath, { ...store, [key]: next });

  return {
    ...buildTrendReturn({ key, next, prev }),
    persistence: 'file',
  };
}
