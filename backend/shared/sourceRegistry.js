/**
 * Source registry — all scrapeable brand stores and marketplaces.
 *
 * Each entry declares:
 *   name        — display label
 *   kind        — 'official' | 'marketplace'
 *   categories  — subset of ['phone', 'laptop', 'tablet']
 *   buildSearchUrl(query)  — search-results page URL
 *   enabled     — flip to false to skip without removing
 */

const SOURCES = [
  // ─── Marketplaces (best reliability — HTML includes prices) ──────────
  {
    name: 'Amazon',
    kind: 'marketplace',
    categories: ['phone', 'laptop', 'tablet'],
    buildSearchUrl: (q) => `https://www.amazon.in/s?k=${encodeURIComponent(q)}`,
    enabled: true,
  },
  {
    name: 'Flipkart',
    kind: 'marketplace',
    categories: ['phone', 'laptop', 'tablet'],
    buildSearchUrl: (q) => `https://www.flipkart.com/search?q=${encodeURIComponent(q)}`,
    enabled: true,
  },
  {
    name: 'Croma',
    kind: 'marketplace',
    categories: ['phone', 'laptop', 'tablet'],
    buildSearchUrl: (q) => `https://www.croma.com/searchB?q=${encodeURIComponent(q)}`,
    enabled: true,
  },
  {
    name: 'Reliance Digital',
    kind: 'marketplace',
    categories: ['phone', 'laptop', 'tablet'],
    buildSearchUrl: (q) => `https://www.reliancedigital.in/search?q=${encodeURIComponent(q)}`,
    enabled: true,
  },

  // ─── Phone brand stores ─────────────────────────────────────────────
  {
    name: 'Samsung',
    kind: 'official',
    categories: ['phone', 'laptop', 'tablet'],
    buildSearchUrl: (q) => `https://www.samsung.com/in/search/?searchvalue=${encodeURIComponent(q)}`,
    enabled: false,
  },
  {
    name: 'Motorola',
    kind: 'official',
    categories: ['phone'],
    buildSearchUrl: (q) => `https://www.motorola.in/search?query=${encodeURIComponent(q)}`,
    enabled: false,
  },
  {
    name: 'iQOO',
    kind: 'official',
    categories: ['phone'],
    buildSearchUrl: (q) => `https://www.iqoo.com/in/search?keyword=${encodeURIComponent(q)}`,
    enabled: false,
  },
  {
    name: 'Vivo',
    kind: 'official',
    categories: ['phone', 'tablet'],
    buildSearchUrl: (q) => `https://www.vivo.com/in/search?keyword=${encodeURIComponent(q)}`,
    enabled: false,
  },
  {
    name: 'OnePlus',
    kind: 'official',
    categories: ['phone', 'tablet'],
    buildSearchUrl: (q) => `https://www.oneplus.in/search?keyword=${encodeURIComponent(q)}`,
    enabled: false,
  },
  {
    name: 'Xiaomi',
    kind: 'official',
    categories: ['phone', 'laptop', 'tablet'],
    buildSearchUrl: (q) => `https://www.mi.com/in/search?keyword=${encodeURIComponent(q)}`,
    enabled: false,
  },
  {
    name: 'Realme',
    kind: 'official',
    categories: ['phone', 'tablet'],
    buildSearchUrl: (q) => `https://www.realme.com/in/search?q=${encodeURIComponent(q)}`,
    enabled: false,
  },
  {
    name: 'OPPO',
    kind: 'official',
    categories: ['phone', 'tablet'],
    buildSearchUrl: (q) => `https://www.oppo.com/in/search/?q=${encodeURIComponent(q)}`,
    enabled: false,
  },
  {
    name: 'Nothing',
    kind: 'official',
    categories: ['phone'],
    buildSearchUrl: (q) => `https://in.nothing.tech/search?q=${encodeURIComponent(q)}`,
    enabled: false,
  },
  {
    name: 'Apple',
    kind: 'official',
    categories: ['phone', 'laptop', 'tablet'],
    buildSearchUrl: (q) => `https://www.apple.com/in/shop/buy-iphone?fh=${encodeURIComponent(q)}`,
    enabled: false,
  },

  // ─── Laptop brand stores ───────────────────────────────────────────
  {
    name: 'ASUS',
    kind: 'official',
    categories: ['laptop'],
    buildSearchUrl: (q) => `https://www.asus.com/in/searchresult?searchType=product&searchKey=${encodeURIComponent(q)}`,
    enabled: false,
  },
  {
    name: 'Lenovo',
    kind: 'official',
    categories: ['laptop', 'tablet'],
    buildSearchUrl: (q) => `https://www.lenovo.com/in/en/search?q=${encodeURIComponent(q)}`,
    enabled: false,
  },
  {
    name: 'HP',
    kind: 'official',
    categories: ['laptop'],
    buildSearchUrl: (q) => `https://www.hp.com/in-en/shop/search.aspx?searchterm=${encodeURIComponent(q)}`,
    enabled: false,
  },
  {
    name: 'Dell',
    kind: 'official',
    categories: ['laptop'],
    buildSearchUrl: (q) => `https://www.dell.com/in/en/search/${encodeURIComponent(q)}`,
    enabled: false,
  },
  {
    name: 'Acer',
    kind: 'official',
    categories: ['laptop'],
    buildSearchUrl: (q) => `https://store.acer.com/en-in/catalogsearch/result/?q=${encodeURIComponent(q)}`,
    enabled: false,
  },
  {
    name: 'MSI',
    kind: 'official',
    categories: ['laptop'],
    buildSearchUrl: (q) => `https://www.msi.com/search/${encodeURIComponent(q)}`,
    enabled: false,
  },
];

/**
 * Get all enabled sources for a given category.
 * @param {'phone'|'laptop'|'tablet'} [category] — if omitted returns all enabled
 */
export function getSourcesForCategory(category) {
  return SOURCES.filter((s) => {
    if (!s.enabled) return false;
    if (category && !s.categories.includes(category)) return false;
    return true;
  });
}

/** Get just the marketplace sources for a category. */
export function getMarketplaces(category) {
  return getSourcesForCategory(category).filter((s) => s.kind === 'marketplace');
}

/** Get just the official brand stores for a category. */
export function getOfficialStores(category) {
  return getSourcesForCategory(category).filter((s) => s.kind === 'official');
}

/** All source names (for health check / UI). */
export function getAllSourceNames() {
  return SOURCES.filter((s) => s.enabled).map((s) => s.name);
}

export { SOURCES };
