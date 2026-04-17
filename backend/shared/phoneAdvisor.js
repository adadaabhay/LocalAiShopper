import { getAiProvider } from './providers/index.js';
import { scrapePhoneOffers, scrapeDirectOffer } from './scrapeOffers.js';
import { confirmOfferVariants } from './offerVariantConfirm.js';
import { updatePriceHistory } from './priceHistory.js';
import { fetchReviewSignals } from './reviewSignals.js';

function extractFirstJsonObject(text) {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first < 0 || last < 0 || last <= first) {
    throw new Error('No JSON object found in model response.');
  }
  return JSON.parse(cleaned.slice(first, last + 1));
}

function median(values) {
  if (!values.length) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function normalizeGbMb(value) {
  if (!value || typeof value !== 'string') return '';
  return value.replace(/\s+/g, '').toUpperCase();
}

function isMobileCategory(category) {
  return category === 'phone' || category === 'tablet' || category === 'smartwatch';
}

// ── Category-aware heuristic scoring ──────────────────────────────────

function computePhoneHeuristicScores({ ram, storage, bestPrice, budget }) {
  const ramValue = Number.parseInt(ram, 10) || 8;
  const storageValue = Number.parseInt(storage, 10) || 128;
  const budgetSafety = budget > 0 ? Math.max(0, Math.min(100, (budget / Math.max(bestPrice, 1)) * 100)) : 70;
  const performance = Math.min(100, 35 + ramValue * 5 + (storageValue >= 256 ? 12 : 0));
  const value = Math.round((performance * 0.45 + budgetSafety * 0.55) * 10) / 10;
  const battery = Math.min(100, 60 + Math.floor(ramValue / 2) * 4);
  const camera = Math.min(100, 58 + (storageValue >= 256 ? 8 : 3));
  const display = Math.min(100, 62 + (storageValue >= 256 ? 6 : 2));
  const thermals = Math.min(100, 60 + (storageValue >= 256 ? 5 : 1));
  const software = Math.min(100, 70 + (ramValue >= 12 ? 10 : 0));

  return {
    overall: Math.round((performance * 0.35 + value * 0.4 + camera * 0.12 + battery * 0.13) * 10) / 10,
    performance,
    value,
    camera,
    battery,
    display,
    thermals,
    software,
  };
}

function computeLaptopHeuristicScores({ ram, storage, bestPrice, budget }) {
  const ramValue = Number.parseInt(ram, 10) || 16;
  const storageValue = Number.parseInt(storage, 10) || 512;
  const budgetSafety = budget > 0 ? Math.max(0, Math.min(100, (budget / Math.max(bestPrice, 1)) * 100)) : 70;
  const performance = Math.min(100, 30 + ramValue * 3 + (storageValue >= 512 ? 15 : 5));
  const value = Math.round((performance * 0.45 + budgetSafety * 0.55) * 10) / 10;
  const battery = Math.min(100, 50 + (ramValue <= 16 ? 15 : 5)); // lower RAM laptops tend to have better battery
  const display = Math.min(100, 55 + (bestPrice > 60000 ? 20 : bestPrice > 40000 ? 10 : 3));
  const keyboard = Math.min(100, 60 + (bestPrice > 80000 ? 15 : 5));
  const thermals = Math.min(100, 45 + (ramValue <= 16 ? 15 : 5) + (storageValue >= 512 ? 5 : 0));
  const buildQuality = Math.min(100, 50 + (bestPrice > 70000 ? 20 : bestPrice > 40000 ? 10 : 3));
  const portability = Math.min(100, 65 - (ramValue >= 32 ? 10 : 0));

  return {
    overall: Math.round((performance * 0.35 + value * 0.3 + display * 0.15 + battery * 0.1 + thermals * 0.1) * 10) / 10,
    performance,
    value,
    display,
    battery,
    keyboard,
    thermals,
    buildQuality,
    portability,
  };
}

function computeGenericHeuristicScores({ bestPrice, budget, category }) {
  const budgetSafety = budget > 0 ? Math.max(0, Math.min(100, (budget / Math.max(bestPrice, 1)) * 100)) : 70;
  const categoryBias =
    category === 'tv' ? 6 : category === 'camera' ? 8 : category === 'console' ? 7 : category === 'monitor' ? 5 : 4;
  const performance = Math.min(100, 55 + categoryBias);
  const value = Math.round((performance * 0.42 + budgetSafety * 0.58) * 10) / 10;
  const buildQuality = Math.min(100, 58 + categoryBias);
  const reliability = Math.min(100, 60 + Math.floor(categoryBias / 2));
  const battery = category === 'tv' || category === 'monitor' || category === 'speaker' ? 0 : 64 + categoryBias;
  const brandSupport = Math.min(100, 62 + categoryBias);

  return {
    overall: Math.round((performance * 0.35 + value * 0.3 + buildQuality * 0.2 + reliability * 0.15) * 10) / 10,
    performance,
    value,
    buildQuality,
    reliability,
    battery,
    brandSupport,
  };
}

function computeHeuristicScores({ ram, storage, bestPrice, budget, category }) {
  if (category === 'laptop') {
    return computeLaptopHeuristicScores({ ram, storage, bestPrice, budget });
  }
  if (isMobileCategory(category)) {
    return computePhoneHeuristicScores({ ram, storage, bestPrice, budget });
  }
  return computeGenericHeuristicScores({ bestPrice, budget, category });
}

function blendHeuristicWithReviews(heuristic, reviewSignals) {
  const reviewScore10 = Number(reviewSignals?.averageScore10);
  const isVerified = reviewSignals?.verifiedCount > 0;

  if (!Number.isFinite(reviewScore10) || reviewScore10 <= 0) {
    return heuristic;
  }

  const reviewScore100 = reviewScore10 * 10;
  const blended = { ...heuristic };

  // If reviews are verified, let real-world sentiment dominate (80% impact)
  const revWeight = isVerified ? 0.8 : 0.4;
  const heuristicWeight = 1 - revWeight;

  blended.overall = Math.round((heuristic.overall * heuristicWeight + reviewScore100 * revWeight) * 10) / 10;
  if (Number.isFinite(heuristic.value)) {
    blended.value = Math.round((heuristic.value * 0.5 + reviewScore100 * 0.5) * 10) / 10;
  }
  if (Number.isFinite(heuristic.performance)) {
    blended.performance = Math.round((heuristic.performance * 0.75 + reviewScore100 * 0.25) * 10) / 10;
  }

  return blended;
}

function clamp10(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 5;
  return Math.min(10, Math.max(0, Math.round(x * 10) / 10));
}

function briefScoresFromHeuristic(h, category) {
  if (category === 'laptop') {
    return {
      performance: clamp10(h.performance / 10),
      display: clamp10(h.display / 10),
      keyboard: clamp10(h.keyboard / 10),
      battery: clamp10(h.battery / 10),
      buildQuality: clamp10(h.buildQuality / 10),
    };
  }
  if (!isMobileCategory(category)) {
    return {
      value: clamp10(h.value / 10),
      performance: clamp10(h.performance / 10),
      buildQuality: clamp10(h.buildQuality / 10),
      brandSupport: clamp10(h.brandSupport / 10),
      battery: clamp10((h.battery || 0) / 10),
    };
  }
  return {
    camera: clamp10(h.camera / 10),
    performance: clamp10(h.performance / 10),
    durability: clamp10((h.thermals + h.display) / 20),
    companyService: clamp10(h.software / 10),
    battery: clamp10(h.battery / 10),
  };
}

function defaultPhoneBenchmarks(h, input) {
  return [
    {
      area: 'Processor & sustained performance',
      score: clamp10(h.performance / 10),
      detail: `Class estimate from ${input.ram} RAM and storage tier; not a synthetic bench.`,
    },
    {
      area: 'Camera system',
      score: clamp10(h.camera / 10),
      detail: 'General tier score—verify sensor lineup and zoom for your priorities.',
    },
    {
      area: 'Battery endurance',
      score: clamp10(h.battery / 10),
      detail: 'Expected longevity for this segment; modems and brightness change real-world hours.',
    },
    {
      area: 'Thermals & sustained loads',
      score: clamp10(h.thermals / 10),
      detail: 'Proxy for gaming/long capture sessions from class and cooling assumptions.',
    },
    {
      area: 'Display',
      score: clamp10(h.display / 10),
      detail: 'Panel class from variant norms; check PWM and peak nits if you care.',
    },
    {
      area: 'Build & durability',
      score: clamp10((h.thermals + h.display) / 20),
      detail: 'Frame/glass/IP rating not scraped; conservative proxy from price band.',
    },
    {
      area: 'Software & OEM support',
      score: clamp10(h.software / 10),
      detail: `Update cadence and skin assumptions for ${(input.brand || '').split(' ')[0] || 'this OEM'}.`,
    },
    {
      area: 'Value vs live listings',
      score: clamp10(h.value / 10),
      detail: 'How asking prices line up with your budget and the offers we could scrape.',
    },
  ];
}

function defaultLaptopBenchmarks(h, input) {
  return [
    {
      area: 'CPU & multi-core performance',
      score: clamp10(h.performance / 10),
      detail: `Estimated from ${input.ram} RAM and storage tier. Verify with Cinebench/Geekbench reviews.`,
    },
    {
      area: 'Display quality',
      score: clamp10(h.display / 10),
      detail: 'Panel class estimate from price band. Check sRGB/DCI-P3 coverage and refresh rate.',
    },
    {
      area: 'Keyboard & trackpad',
      score: clamp10(h.keyboard / 10),
      detail: 'Estimated from price segment. Typing feel is subjective—try in store if possible.',
    },
    {
      area: 'Battery life',
      score: clamp10(h.battery / 10),
      detail: 'Higher-RAM/GPU laptops tend to draw more power. Verify real-world battery reviews.',
    },
    {
      area: 'Thermals & fan noise',
      score: clamp10(h.thermals / 10),
      detail: 'Thermal design matters for sustained workloads. Check teardown reviews.',
    },
    {
      area: 'Build quality & portability',
      score: clamp10(h.buildQuality / 10),
      detail: 'Material and weight estimate from price band. Check chassis material (aluminum vs plastic).',
    },
    {
      area: 'Port selection & connectivity',
      score: clamp10(h.portability / 10),
      detail: 'USB-C/Thunderbolt availability varies. Verify ports match your peripherals.',
    },
    {
      area: 'Value vs live listings',
      score: clamp10(h.value / 10),
      detail: 'How asking prices line up with your budget and the offers we could scrape.',
    },
  ];
}

function defaultGenericBenchmarks(h, input, category) {
  const label = (category || 'product').toUpperCase();
  const batteryScore = h.battery > 0 ? clamp10(h.battery / 10) : 0;

  return [
    {
      area: 'Core performance',
      score: clamp10(h.performance / 10),
      detail: `${label} performance tier estimate for day-to-day and burst workloads.`,
    },
    {
      area: 'Value for money',
      score: clamp10(h.value / 10),
      detail: 'Price-to-feature balance using the scraped listings and your budget.',
    },
    {
      area: 'Build quality',
      score: clamp10(h.buildQuality / 10),
      detail: 'Expected fit/finish and materials for this product segment.',
    },
    {
      area: 'Reliability',
      score: clamp10(h.reliability / 10),
      detail: 'Estimated long-run consistency and stability for this class of device.',
    },
    {
      area: 'Brand support',
      score: clamp10(h.brandSupport / 10),
      detail: `Support confidence from ${(input.brand || '').split(' ')[0] || 'brand'} service norms.`,
    },
    {
      area: batteryScore > 0 ? 'Battery profile' : 'Power efficiency',
      score: batteryScore > 0 ? batteryScore : clamp10((h.reliability + h.value) / 20),
      detail: batteryScore > 0
        ? 'Battery life estimate for this category and price band.'
        : 'Plugged-in efficiency estimate for non-battery-centric devices.',
    },
    {
      area: 'Feature completeness',
      score: clamp10((h.performance + h.buildQuality) / 20),
      detail: 'How complete the overall spec set is likely to feel at this price.',
    },
    {
      area: 'Purchase confidence',
      score: clamp10(h.overall / 10),
      detail: 'Combined readiness score from value, reliability, and build assumptions.',
    },
  ];
}

function defaultHardwareBenchmarks(h, input, category) {
  if (category === 'laptop') return defaultLaptopBenchmarks(h, input);
  if (!isMobileCategory(category)) return defaultGenericBenchmarks(h, input, category);
  return defaultPhoneBenchmarks(h, input);
}

function enrichAdvice(ai, heuristic, input, category) {
  const base = ai && typeof ai === 'object' ? ai : {};
  const b = base.briefScores;

  let brief;
  if (b && typeof b === 'object') {
    if (category === 'laptop') {
      brief = {
        performance: clamp10(b.performance),
        display: clamp10(b.display),
        keyboard: clamp10(b.keyboard),
        battery: clamp10(b.battery),
        buildQuality: clamp10(b.buildQuality ?? b.build_quality ?? b.build),
      };
    } else if (!isMobileCategory(category)) {
      brief = {
        value: clamp10(b.value),
        performance: clamp10(b.performance),
        buildQuality: clamp10(b.buildQuality ?? b.build_quality ?? b.build),
        brandSupport: clamp10(b.brandSupport ?? b.brand_support ?? b.support),
        battery: clamp10(b.battery),
      };
    } else {
      brief = {
        camera: clamp10(b.camera),
        performance: clamp10(b.performance),
        durability: clamp10(b.durability),
        companyService: clamp10(b.companyService ?? b.company_service),
        battery: clamp10(b.battery),
      };
    }
  } else {
    brief = briefScoresFromHeuristic(heuristic, category);
  }

  let hw = base.hardwareBenchmarks;
  if (!Array.isArray(hw) || hw.length === 0) {
    hw = defaultHardwareBenchmarks(heuristic, input, category);
  } else {
    hw = hw.map((row) => ({
      area: String(row.area || row.metric || 'Area'),
      score: clamp10(row.score > 10 ? row.score / 10 : row.score),
      detail: String(row.detail || row.note || ''),
    }));
  }

  // Remove AI-generated alternatives and cautions — they hallucinate model names and prices.
  // We always use our deterministic alternatives computed from real scraped offers instead.
  const { alternatives: _aiAlts, cautions: _aiCautions, ...safeBase } = base;

  return { ...safeBase, briefScores: brief, hardwareBenchmarks: hw, aiCautions: _aiCautions };
}

function summarizeOffersForPrompt(offers) {
  return offers.slice(0, 4).map((offer) => ({
    store: offer.store,
    priceLabel: offer.priceLabel,
    ram: offer.ram,
    storage: offer.storage,
    processor: offer.processor || undefined,
    matchMode: offer.variantMatchMode,
    pdpConfirmed: offer.variantConfirmed,
  }));
}

function buildPhonePrompt({ input, variantMatchedOffersForPrompt, alternativesForPrompt, heuristic }) {
  return `
You are LocalAiShopper Mobile Advisor.
Use the scraped offers and user preferences to generate concise buyer guidance.

User input:
${JSON.stringify(input, null, 2)}

Variant-matched offers (RAM/storage):
${JSON.stringify(variantMatchedOffersForPrompt, null, 2)}

Possible alternatives within your range:
${JSON.stringify(alternativesForPrompt, null, 2)}

Heuristic score seed:
${JSON.stringify(heuristic, null, 2)}

Important Context for unknown values:
If the user input or offers suggest RAM or Storage is "Unknown", keep them unknown. Do not infer missing specs from memory and do not invent variant details.

Return strict JSON only:
{
  "insight": "string",
  "buyVerdict": "Buy now|Wait|Track price",
  "briefScores": {
    "camera": 0,
    "performance": 0,
    "durability": 0,
    "companyService": 0,
    "battery": 0
  },
  "hardwareBenchmarks": [
    { "area": "CPU/Performance", "score": 0, "detail": "string (succinct gist of power)" },
    { "area": "RAM & Storage Speed", "score": 0, "detail": "string (succinct gist)" },
    { "area": "Display & Screen", "score": 0, "detail": "string (succinct gist)" },
    { "area": "Camera Sensors", "score": 0, "detail": "string (succinct gist)" },
    { "area": "Battery Reliability", "score": 0, "detail": "string (succinct gist)" },
    { "area": "Hardware Durability", "score": 0, "detail": "string (succinct gist)" }
  ],
  "benchmarks": [
    { "metric": "Overall Value", "score": 0, "note": "string" },
    { "metric": "Raw Performance", "score": 0, "note": "string" },
    { "metric": "Camera Optics", "score": 0, "note": "string" },
    { "metric": "Battery Lasting", "score": 0, "note": "string" },
    { "metric": "Panel Quality", "score": 0, "note": "string" },
    { "metric": "Thermals", "score": 0, "note": "string" }
  ],
  "alternatives": [
    {
      "model": "string",
      "why": "string",
      "estimatedPriceLabel": "string"
    }
  ],
  "cautions": ["string"]
}

Rules:
- ALL scores across the entire JSON object (including benchmarks and hardwareBenchmarks) MUST STRICTLY be on a scale of 0 to 10 (e.g. 8.5).
- Your 'hardwareBenchmarks' array must contain exactly the 6 requested areas above!
- Provide a clear, insightful 'detail' gist for every area explaining exactly why it received that score.
- Keep alternatives and cautions to max 4.
- IMPORTANT: Use only the provided variant data and general category knowledge. Never invent missing specs or exact technical details.
`.trim();
}

function buildLaptopPrompt({ input, variantMatchedOffersForPrompt, alternativesForPrompt, heuristic }) {
  return `
You are LocalAiShopper Laptop Advisor.
Use the scraped offers and user preferences to generate concise buyer guidance.

User input:
${JSON.stringify(input, null, 2)}

Variant-matched offers (RAM/storage):
${JSON.stringify(variantMatchedOffersForPrompt, null, 2)}

Possible alternatives within your range:
${JSON.stringify(alternativesForPrompt, null, 2)}

Heuristic score seed:
${JSON.stringify(heuristic, null, 2)}

Important Context for unknown values:
If the user input or offers suggest RAM or Storage is "Unknown", keep them unknown. Do not infer missing specs from memory and do not invent variant details.

Return strict JSON only:
{
  "insight": "string",
  "buyVerdict": "Buy now|Wait|Track price",
  "briefScores": {
    "performance": 0,
    "display": 0,
    "keyboard": 0,
    "battery": 0,
    "buildQuality": 0
  },
  "hardwareBenchmarks": [
    { "area": "CPU/Multi-core", "score": 0, "detail": "string (succinct gist)" },
    { "area": "Heating/Thermals", "score": 0, "detail": "string (succinct gist)" },
    { "area": "RAM & Storage Tier", "score": 0, "detail": "string (succinct gist)" },
    { "area": "Display nits/sRGB", "score": 0, "detail": "string (succinct gist)" },
    { "area": "Battery Life", "score": 0, "detail": "string (succinct gist)" },
    { "area": "Hardware Durability", "score": 0, "detail": "string (succinct gist)" }
  ],
  "benchmarks": [
    { "metric": "Overall Value", "score": 0, "note": "string" },
    { "metric": "Processing", "score": 0, "note": "string" },
    { "metric": "Screen Quality", "score": 0, "note": "string" },
    { "metric": "Battery Lasting", "score": 0, "note": "string" },
    { "metric": "Cooling/Fans", "score": 0, "note": "string" },
    { "metric": "Build Solidness", "score": 0, "note": "string" }
  ],
  "alternatives": [
    {
      "model": "string",
      "why": "string",
      "estimatedPriceLabel": "string"
    }
  ],
  "cautions": ["string"]
}

Rules:
- ALL scores across the entire JSON object (including benchmarks and hardwareBenchmarks) MUST STRICTLY be on a scale of 0 to 10 (e.g. 8.5).
- Your 'hardwareBenchmarks' array must contain exactly the 6 requested areas above!
- Provide a clear, insightful 'detail' gist for every area explaining exactly why it received that score.
- Keep alternatives and cautions to max 4.
- IMPORTANT: Use only the provided variant data and general category knowledge. Never invent missing specs or exact technical details.
`.trim();
}

function buildGenericPrompt({ input, variantMatchedOffersForPrompt, alternativesForPrompt, heuristic, category }) {
  return `
You are LocalAiShopper Electronics Advisor.
Category: ${category}
Use scraped offers and user preferences to generate concise buyer guidance.

User input:
${JSON.stringify(input, null, 2)}

Variant-matched offers:
${JSON.stringify(variantMatchedOffersForPrompt, null, 2)}

Possible alternatives:
${JSON.stringify(alternativesForPrompt, null, 2)}

Heuristic score seed:
${JSON.stringify(heuristic, null, 2)}

Return strict JSON only:
{
  "insight": "string",
  "buyVerdict": "Buy now|Wait|Track price",
  "briefScores": {
    "value": 0,
    "performance": 0,
    "buildQuality": 0,
    "brandSupport": 0,
    "battery": 0
  },
  "hardwareBenchmarks": [
    { "area": "Core performance", "score": 0, "detail": "string" },
    { "area": "Value for money", "score": 0, "detail": "string" },
    { "area": "Build quality", "score": 0, "detail": "string" },
    { "area": "Reliability", "score": 0, "detail": "string" },
    { "area": "Brand support", "score": 0, "detail": "string" },
    { "area": "Power profile", "score": 0, "detail": "string" }
  ],
  "benchmarks": [
    { "metric": "Overall Value", "score": 0, "note": "string" },
    { "metric": "Performance", "score": 0, "note": "string" },
    { "metric": "Build", "score": 0, "note": "string" },
    { "metric": "Reliability", "score": 0, "note": "string" },
    { "metric": "Support", "score": 0, "note": "string" },
    { "metric": "Power", "score": 0, "note": "string" }
  ],
  "alternatives": [
    {
      "model": "string",
      "why": "string",
      "estimatedPriceLabel": "string"
    }
  ],
  "cautions": ["string"]
}

Rules:
- Keep every score on a strict 0 to 10 scale.
- Keep alternatives and cautions to max 4.
- Use only the scraped offer data and broad category-level assumptions.
`.trim();
}

function buildAdvisorPrompt({ input, variantMatchedOffersForPrompt, alternativesForPrompt, heuristic, category }) {
  if (category === 'laptop') {
    return buildLaptopPrompt({ input, variantMatchedOffersForPrompt, alternativesForPrompt, heuristic });
  }
  if (!isMobileCategory(category)) {
    return buildGenericPrompt({
      input,
      variantMatchedOffersForPrompt,
      alternativesForPrompt,
      heuristic,
      category,
    });
  }
  return buildPhonePrompt({ input, variantMatchedOffersForPrompt, alternativesForPrompt, heuristic });
}

function computeAlternativesDeterministic({ input, offers, budget }) {
  const desiredRam = normalizeGbMb(input.ram);
  const desiredStorage = normalizeGbMb(input.storage);

  const budgetCap = budget > 0 ? budget * 1.25 : Number.POSITIVE_INFINITY;
  const withinBudget = offers.filter((o) => Number.isFinite(o.priceValue) && o.priceValue <= budgetCap);

  const candidates = withinBudget.length ? withinBudget : offers;
  const sorted = [...candidates].sort((a, b) => a.priceValue - b.priceValue);

  const selected = (ram, storage) => `${ram || 'Unknown'} / ${storage || 'Unknown'}`;

  const picks = [];
  for (const offer of sorted) {
    const ram = normalizeGbMb(offer.ram);
    const storage = normalizeGbMb(offer.storage);
    const ramDiff = desiredRam && ram && ram !== 'UNKNOWN' && ram !== desiredRam;
    const storageDiff = desiredStorage && storage && storage !== 'UNKNOWN' && storage !== desiredStorage;
    const differs = ramDiff || storageDiff;
    if (!differs) continue;
    const approxWhy = `Different variant (${selected(offer.ram, offer.storage)} vs ${selected(input.ram, input.storage)}).`;
    picks.push({
      model: `${input.brand} ${input.model} (${offer.ram}/${offer.storage})`.trim(),
      why: approxWhy,
      estimatedPriceLabel: offer.priceLabel,
    });
    if (picks.length >= 4) break;
  }

  if (picks.length) return picks;

  // If we can't detect variant differences, just suggest next cheapest options.
  for (const offer of sorted) {
    picks.push({
      model: `${input.brand} ${input.model}`.trim(),
      why: 'Backup option if exact variant availability or pricing doesn\'t match.',
      estimatedPriceLabel: offer.priceLabel,
    });
    if (picks.length >= 3) break;
  }
  return picks;
}

function createFallbackAdvice({ heuristic, alternatives, input, category, hasLiveOffers = true }) {
  return {
    insight:
      hasLiveOffers ? 'This recommendation is generated from scraped prices plus heuristic scoring. Use it as a shortlist before final checkout.' : 'No live matching offers were found for this exact variant right now. Treat these scores as provisional until listings appear.',
    buyVerdict: alternatives.length > 0 ? 'Track price' : 'Wait',
    briefScores: briefScoresFromHeuristic(heuristic, category),
    hardwareBenchmarks: defaultHardwareBenchmarks(heuristic, input, category),
    benchmarks: category === 'laptop'
      ? [
          { metric: 'Overall', score: heuristic.overall, note: 'Balanced view from current variant and listed prices.' },
          { metric: 'CPU Performance', score: heuristic.performance, note: 'Estimated using RAM and variant assumptions.' },
          { metric: 'Value', score: heuristic.value, note: 'Compares best listed price against your budget.' },
          { metric: 'Display', score: heuristic.display, note: 'Estimated screen quality for this price tier.' },
          { metric: 'Battery', score: heuristic.battery, note: 'Battery estimate from specs and price tier.' },
          { metric: 'Thermals', score: heuristic.thermals, note: 'Thermal estimate based on performance envelope.' },
          { metric: 'Build Quality', score: heuristic.buildQuality, note: 'Build estimate from price tier.' },
          { metric: 'Keyboard', score: heuristic.keyboard, note: 'Keyboard quality estimate from price tier.' },
        ]
      : isMobileCategory(category)
      ? [
          { metric: 'Overall', score: heuristic.overall, note: 'Balanced view from current variant and listed prices.' },
          { metric: 'Performance', score: heuristic.performance, note: 'Estimated using RAM and variant assumptions.' },
          { metric: 'Value', score: heuristic.value, note: 'Compares best listed price against your budget.' },
          { metric: 'Camera', score: heuristic.camera, note: 'Generalized estimate for this tier.' },
          { metric: 'Battery', score: heuristic.battery, note: 'Generalized estimate from class and RAM.' },
          { metric: 'Display', score: heuristic.display, note: 'Estimated screen quality for this tier.' },
          { metric: 'Thermals', score: heuristic.thermals, note: 'General estimate based on performance envelope.' },
          { metric: 'Software', score: heuristic.software, note: 'Estimated based on device class and RAM tier.' },
        ]
      : [
          { metric: 'Overall', score: heuristic.overall, note: 'Balanced view from listed prices and category assumptions.' },
          { metric: 'Performance', score: heuristic.performance, note: 'Category-weighted estimate for this product class.' },
          { metric: 'Value', score: heuristic.value, note: 'Compares best listed price against your budget.' },
          { metric: 'Build quality', score: heuristic.buildQuality, note: 'Expected fit and finish from this segment.' },
          { metric: 'Reliability', score: heuristic.reliability, note: 'Likely long-run stability for this category.' },
          { metric: 'Brand support', score: heuristic.brandSupport, note: 'Service and support expectation for this OEM.' },
          { metric: 'Power profile', score: heuristic.battery || 0, note: 'Battery score for portable products, efficiency for others.' },
        ],
    alternatives,
    cautions: ['Prices may change quickly. Verify listing details and seller rating before paying.'],
  };
}

function createVerifiedReviewsMissingResponse({ input, category, fetchedAt, offers }) {
  return {
    provider: 'verified-review-gate',
    category,
    query: `${input.brand} ${input.model} ${input.ram} ${input.storage}`.trim(),
    selectedVariant: {
      brand: input.brand,
      model: input.model,
      ram: input.ram,
      storage: input.storage,
      budget: input.budget,
    },
    pricing: {
      bestPriceValue: null,
      bestPriceLabel: 'Unavailable',
      medianPriceValue: null,
      medianPriceLabel: 'Unavailable',
      totalOffers: offers.length,
      fetchedAt,
    },
    offers,
    insight: 'Not found: verified review ratings were not available from trusted sources for this exact product.',
    buyVerdict: 'Not found',
    benchmarks: [],
    alternatives: [],
    cautions: [
      'Not found: no structured verified review rating available from trusted review sources.',
      'Try a more exact model name or provide a direct product URL.',
    ],
    reviews: {
      averageScore10: null,
      verifiedSourceCount: 0,
      sources: [],
      blendPolicy: 'Ratings are blocked when verified-review evidence is missing.',
    },
  };
}

export async function advisePhonePurchase(input) {
  const category = input.category || 'phone';
  const query = `${input.brand} ${input.model} ${input.ram} ${input.storage}`.trim();
  const pipeline = await scrapePhoneOffers(query, category);
  const scrapedOffers = Array.isArray(pipeline.offers) ? pipeline.offers : [];
  const directOffer = input.directUrl ? await scrapeDirectOffer(input.directUrl, category) : null;
  const directFallback = input.directUrl
    ? {
        store: 'Direct URL',
        sourceType: 'direct_link',
        title: `${input.brand} ${input.model} (direct link)` .trim(),
        priceValue: null,
        priceLabel: 'Price not detected',
        ram: input.ram || 'Unknown',
        storage: input.storage || 'Unknown',
        processor: null,
        url: input.directUrl,
        confidence: 'high',
        trustScore: 0.9,
        trustWeight: -2,
        freshness: 'live',
        variantConfirmed: true,
        variantMode: 'unknown',
      }
    : null;
  const offers = [...(directOffer ? [directOffer] : directFallback ? [directFallback] : []), ...scrapedOffers];
  const desiredRam = normalizeGbMb(input.ram);
  const desiredStorage = normalizeGbMb(input.storage);

  const manualPrice = Number.isFinite(input.manualPrice) ? Number(input.manualPrice) : 0;
  const manualOffer =
    manualPrice > 0
      ? [
          {
            store: 'Manual',
            sourceType: 'override',
            title: `${input.brand} ${input.model} (${input.ram}/${input.storage})`,
            priceValue: manualPrice,
            priceLabel: `Rs. ${manualPrice.toLocaleString('en-IN')}`,
            ram: input.ram,
            storage: input.storage,
            processor: null,
            url: '',
            confidence: 'high',
            trustScore: 1,
            trustWeight: -1,
            freshness: 'manual',
          },
        ]
      : [];

  const offersWithManual = [...manualOffer, ...offers];

  // Confirm variant details on the top offers (best-effort).
  let confirmedOffers = offersWithManual;
  try {
    confirmedOffers = await confirmOfferVariants({
      offers: offersWithManual,
      desiredRam,
      desiredStorage,
      category,
    });
  } catch {
    confirmedOffers = offersWithManual;
  }

  const decoratedOffers = confirmedOffers.map((offer) => {
    const confirmedRam = offer.variantConfirmed ? offer.confirmedRam ?? offer.ram : offer.ram;
    const confirmedStorage = offer.variantConfirmed ? offer.confirmedStorage ?? offer.storage : offer.storage;
    const baseVariantMode =
      offer.variantMode === 'strict' || offer.variantMode === 'partial' ? offer.variantMode : null;

    const ram = normalizeGbMb(confirmedRam);
    const storage = normalizeGbMb(confirmedStorage);
    const ramMatches = desiredRam && ram && ram !== 'UNKNOWN' ? ram === desiredRam : false;
    const storageMatches =
      desiredStorage && storage && storage !== 'UNKNOWN' ? storage === desiredStorage : false;

    const derivedMode = ramMatches && storageMatches ? 'strict' : ramMatches || storageMatches ? 'partial' : 'unknown';
    const variantMatchMode = baseVariantMode ?? derivedMode;

    return {
      ...offer,
      ram: confirmedRam ?? offer.ram,
      storage: confirmedStorage ?? offer.storage,
      variantConfirmed: Boolean(offer.variantConfirmed),
      variantMatchMode,
    };
  });

  const matchPriority = (mode) => (mode === 'strict' ? 0 : mode === 'partial' ? 1 : 2);
  const candidates = decoratedOffers
    .filter((offer) => Number.isFinite(offer.priceValue) || offer.sourceType === 'direct_link')
    .sort((a, b) => {
      const ap = matchPriority(a.variantMatchMode);
      const bp = matchPriority(b.variantMatchMode);
      if (ap !== bp) return ap - bp;

      const aw = Number.isFinite(a.trustWeight) ? a.trustWeight : 1;
      const bw = Number.isFinite(b.trustWeight) ? b.trustWeight : 1;
      if (aw !== bw) return aw - bw;

      const av = Number.isFinite(a.priceValue) ? a.priceValue : Number.MAX_SAFE_INTEGER;
      const bv = Number.isFinite(b.priceValue) ? b.priceValue : Number.MAX_SAFE_INTEGER;
      return av - bv;
    });

  const strictMatches = candidates.filter((o) => o.variantMatchMode === 'strict');
  const partialMatches = candidates.filter((o) => o.variantMatchMode === 'partial');
  const baseOffers = strictMatches.length ? strictMatches : partialMatches.length ? partialMatches : candidates;

  let reviewSignals = { averageScore10: null, verifiedCount: 0, signals: [] };
  try {
    reviewSignals = await fetchReviewSignals({
      brand: input.brand,
      model: input.model,
      category,
    });
  } catch (error) {
    console.warn('Review-signal fetch failed:', error?.message);
  }

  if (!reviewSignals || reviewSignals.verifiedCount === 0) {
    console.warn('No verified review ratings found. Continuing with heuristic only.');
    // Let the pipeline proceed with heuristic scores and AI analysis anyway.
  }

  const pricedOffers = baseOffers.map((offer) => offer.priceValue).filter((n) => Number.isFinite(n));
  const bestOffer = baseOffers[0];
  const bestPrice = pricedOffers.length ? Math.min(...pricedOffers) : 0;
  const medianPrice = median(pricedOffers);
  const baseHeuristic = computeHeuristicScores({
    ram: input.ram,
    storage: input.storage,
    bestPrice,
    budget: input.budget ?? 0,
    category,
  });
  const heuristic = blendHeuristicWithReviews(baseHeuristic, reviewSignals);

  let provider;
  try {
    provider = await getAiProvider();
  } catch (error) {
    console.warn('AI Provider initialization failed, using heuristic fallback:', error?.message);
  }
  // Alternatives should come from all candidates so we can suggest other variants, not only exact matches.
  const alternatives = computeAlternativesDeterministic({
    input,
    offers: candidates,
    budget: input.budget ?? 0,
  });
  const hasLiveOffers = baseOffers.length > 0;
  const prompt = buildAdvisorPrompt({
    input,
    variantMatchedOffersForPrompt: summarizeOffersForPrompt(baseOffers),
    alternativesForPrompt: alternatives.slice(0, 3),
    heuristic,
    category,
  });

  let aiAdvice;
  if (provider && hasLiveOffers) {
    try {
      const raw = await provider.generate(prompt);
      try {
        aiAdvice = extractFirstJsonObject(raw);
      } catch (parseError) {
        // One repair attempt: force strict JSON only (reduces fragile failures).
        const repairPrompt = `
The previous response was not valid JSON.
Return strict JSON only that matches the schema from the original prompt.

Previous response (may contain JSON/text):
${raw}
`.trim();

        const repairedRaw = await provider.generate(repairPrompt);
        aiAdvice = extractFirstJsonObject(repairedRaw);
      }
    } catch (e) {
      console.warn('AI Generation failed:', e?.message);
    }
  }

  if (!aiAdvice) {
    aiAdvice = createFallbackAdvice({
      heuristic,
      alternatives,
      input,
      category,
      hasLiveOffers,
    });
  }

  const enriched = enrichAdvice(aiAdvice, heuristic, input, category);

  const trend = updatePriceHistory({
    brand: input.brand,
    model: input.model,
    ram: input.ram,
    storage: input.storage,
    bestPriceValue: Number.isFinite(bestPrice) ? bestPrice : null,
    medianPriceValue: Number.isFinite(medianPrice) ? medianPrice : null,
  });

  return {
    provider: provider ? provider.name : 'heuristic-fallback',
    category,
    query,
    selectedVariant: {
      brand: input.brand,
      model: input.model,
      ram: input.ram,
      storage: input.storage,
      budget: input.budget,
    },
    pricing: {
      bestPriceValue: bestPrice,
      bestPriceLabel: bestPrice ? `Rs. ${bestPrice.toLocaleString('en-IN')}` : 'Unavailable',
      medianPriceValue: medianPrice,
      medianPriceLabel: medianPrice ? `Rs. ${medianPrice.toLocaleString('en-IN')}` : 'Unavailable',
      totalOffers: baseOffers.length,
      fetchedAt: pipeline.fetchedAt,
    },
    offers: baseOffers.map((offer) => ({
      store: offer.store,
      sourceType: offer.sourceType,
      title: offer.title,
      priceLabel: offer.priceLabel,
      ram: offer.ram,
      storage: offer.storage,
      processor: offer.processor || null,
      url: offer.url,
      confidence: offer.confidence,
      variantMatchMode: offer.variantMatchMode,
      variantConfirmed: offer.variantConfirmed,
    })),
    reviews: {
      averageScore10: reviewSignals.averageScore10,
      verifiedSourceCount: reviewSignals.verifiedCount,
      sources: reviewSignals.signals.map((signal) => ({
        source: signal.source,
        score10: signal.score10,
        evidenceType: signal.evidenceType,
        verified: signal.verified,
        url: signal.url,
      })),
      blendPolicy: 'When verified reviews are available, overall rating blends approximately 20% heuristic + 80% verified review signal.',
    },
    trend,
    ...enriched,
    // ALWAYS use deterministic alternatives from real scraped data, never AI hallucinations
    alternatives,
    // Merge AI cautions with a standard one
    cautions: [
      ...(Array.isArray(enriched.aiCautions) ? enriched.aiCautions.filter(c => typeof c === 'string' && c.length < 200) : []),
      ...(reviewSignals.verifiedCount > 0 ? [] : ['No structured verified review rating was found for this product in the current fetch.']),
      'Prices may change quickly. Verify listing details and seller rating before paying.',
    ].slice(0, 4),
  };
}
