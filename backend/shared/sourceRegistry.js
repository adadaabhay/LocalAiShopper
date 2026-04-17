/**
 * Source registry for scrapeable brand stores and marketplaces.
 */

export const SUPPORTED_CATEGORIES = [
  'phone',
  'laptop',
  'tablet',
  'smartwatch',
  'earbuds',
  'headphones',
  'tv',
  'camera',
  'monitor',
  'speaker',
  'console',
  'desktop',
  'gpu',
  'router',
];

const ALL_CATEGORIES = [...SUPPORTED_CATEGORIES];

const SOURCES = [
  {
    name: 'Amazon',
    kind: 'marketplace',
    categories: ALL_CATEGORIES,
    buildSearchUrl: (q) => `https://www.amazon.in/s?k=${encodeURIComponent(q)}`,
    enabled: true,
  },
  {
    name: 'Flipkart',
    kind: 'marketplace',
    categories: ALL_CATEGORIES,
    buildSearchUrl: (q) => `https://www.flipkart.com/search?q=${encodeURIComponent(q)}`,
    enabled: true,
  },
  {
    name: 'Croma',
    kind: 'marketplace',
    categories: ALL_CATEGORIES,
    buildSearchUrl: (q) => `https://www.croma.com/searchB?q=${encodeURIComponent(q)}`,
    enabled: true,
  },
  {
    name: 'Reliance Digital',
    kind: 'marketplace',
    categories: ALL_CATEGORIES,
    buildSearchUrl: (q) => `https://www.reliancedigital.in/search?q=${encodeURIComponent(q)}`,
    enabled: true,
  },

  {
    name: 'Samsung',
    kind: 'official',
    brand: 'samsung',
    brandAliases: ['galaxy'],
    categories: ['phone', 'laptop', 'tablet', 'smartwatch', 'tv', 'monitor', 'speaker', 'headphones'],
    buildSearchUrl: (q) => `https://www.samsung.com/in/search/?searchvalue=${encodeURIComponent(q)}`,
    enabled: true,
  },
  {
    name: 'Motorola',
    kind: 'official',
    brand: 'motorola',
    brandAliases: ['moto'],
    categories: ['phone', 'smartwatch', 'earbuds'],
    buildSearchUrl: (q) => `https://www.motorola.in/search?query=${encodeURIComponent(q)}`,
    enabled: true,
  },
  {
    name: 'iQOO',
    kind: 'official',
    brand: 'iqoo',
    brandAliases: [],
    categories: ['phone'],
    buildSearchUrl: (q) => `https://www.iqoo.com/in/search?keyword=${encodeURIComponent(q)}`,
    enabled: true,
  },
  {
    name: 'Vivo',
    kind: 'official',
    brand: 'vivo',
    brandAliases: [],
    categories: ['phone', 'tablet', 'smartwatch', 'earbuds'],
    buildSearchUrl: (q) => `https://www.vivo.com/in/search?keyword=${encodeURIComponent(q)}`,
    enabled: true,
  },
  {
    name: 'OnePlus',
    kind: 'official',
    brand: 'oneplus',
    brandAliases: ['one plus'],
    categories: ['phone', 'tablet', 'smartwatch', 'earbuds', 'tv', 'monitor', 'headphones'],
    buildSearchUrl: (q) => `https://www.oneplus.in/search?keyword=${encodeURIComponent(q)}`,
    enabled: true,
  },
  {
    name: 'Xiaomi',
    kind: 'official',
    brand: 'xiaomi',
    brandAliases: ['mi', 'redmi', 'poco'],
    categories: ['phone', 'laptop', 'tablet', 'smartwatch', 'earbuds', 'tv', 'monitor'],
    buildSearchUrl: (q) => `https://www.mi.com/in/search?keyword=${encodeURIComponent(q)}`,
    enabled: true,
  },
  {
    name: 'Realme',
    kind: 'official',
    brand: 'realme',
    brandAliases: [],
    categories: ['phone', 'tablet', 'smartwatch', 'earbuds', 'tv'],
    buildSearchUrl: (q) => `https://www.realme.com/in/search?q=${encodeURIComponent(q)}`,
    enabled: true,
  },
  {
    name: 'OPPO',
    kind: 'official',
    brand: 'oppo',
    brandAliases: [],
    categories: ['phone', 'tablet', 'smartwatch', 'earbuds'],
    buildSearchUrl: (q) => `https://www.oppo.com/in/search/?q=${encodeURIComponent(q)}`,
    enabled: true,
  },
  {
    name: 'Nothing',
    kind: 'official',
    brand: 'nothing',
    brandAliases: [],
    categories: ['phone', 'earbuds', 'smartwatch'],
    buildSearchUrl: (q) => `https://in.nothing.tech/search?q=${encodeURIComponent(q)}`,
    enabled: true,
  },
  {
    name: 'Apple',
    kind: 'official',
    brand: 'apple',
    brandAliases: ['iphone', 'ipad', 'macbook', 'mac', 'airpods', 'watch'],
    categories: ['phone', 'laptop', 'tablet', 'smartwatch', 'earbuds', 'monitor', 'speaker'],
    buildSearchUrl: (q) => `https://www.apple.com/in/search/${encodeURIComponent(q)}?src=globalnav`,
    enabled: true,
  },

  {
    name: 'ASUS',
    kind: 'official',
    brand: 'asus',
    brandAliases: ['rog', 'tuf', 'vivobook', 'zenbook'],
    categories: ['laptop', 'monitor', 'desktop', 'gpu', 'router'],
    buildSearchUrl: (q) => `https://www.asus.com/in/searchresult?SearchKey=${encodeURIComponent(q)}`,
    enabled: true,
  },
  {
    name: 'Lenovo',
    kind: 'official',
    brand: 'lenovo',
    brandAliases: ['thinkpad', 'ideapad', 'legion', 'yoga'],
    categories: ['laptop', 'tablet', 'monitor'],
    buildSearchUrl: (q) => `https://www.lenovo.com/in/en/search?text=${encodeURIComponent(q)}`,
    enabled: true,
  },
  {
    name: 'HP',
    kind: 'official',
    brand: 'hp',
    brandAliases: ['pavilion', 'omen', 'envy', 'spectre', 'victus'],
    categories: ['laptop', 'monitor'],
    buildSearchUrl: (q) => `https://www.hp.com/in-en/search.html?q=${encodeURIComponent(q)}`,
    enabled: true,
  },
  {
    name: 'Dell',
    kind: 'official',
    brand: 'dell',
    brandAliases: ['inspiron', 'xps', 'latitude', 'alienware', 'vostro'],
    categories: ['laptop', 'monitor', 'desktop'],
    buildSearchUrl: (q) => `https://www.dell.com/en-in/search/${encodeURIComponent(q)}`,
    enabled: true,
  },
  {
    name: 'Acer',
    kind: 'official',
    brand: 'acer',
    brandAliases: ['nitro', 'predator', 'aspire', 'swift'],
    categories: ['laptop', 'monitor', 'desktop'],
    buildSearchUrl: (q) => `https://store.acer.com/en-in/catalogsearch/result/?q=${encodeURIComponent(q)}`,
    enabled: true,
  },
  {
    name: 'MSI',
    kind: 'official',
    brand: 'msi',
    brandAliases: ['stealth', 'raider', 'katana', 'crosshair'],
    categories: ['laptop', 'monitor', 'desktop', 'gpu'],
    buildSearchUrl: (q) => `https://www.msi.com/search/${encodeURIComponent(q)}`,
    enabled: true,
  },
  {
    name: 'Sony',
    kind: 'official',
    brand: 'sony',
    brandAliases: ['bravia', 'playstation', 'xperia', 'alpha', 'wh-1000', 'wf-1000'],
    categories: ['phone', 'tv', 'camera', 'earbuds', 'headphones', 'speaker', 'console'],
    buildSearchUrl: (q) => `https://www.sony.co.in/search/${encodeURIComponent(q)}`,
    enabled: true,
  },
  {
    name: 'LG',
    kind: 'official',
    brand: 'lg',
    brandAliases: ['oled', 'ultragear', 'gram'],
    categories: ['tv', 'monitor', 'speaker', 'laptop'],
    buildSearchUrl: (q) => `https://www.lg.com/in/search?q=${encodeURIComponent(q)}`,
    enabled: true,
  },
  {
    name: 'boAt',
    kind: 'official',
    brand: 'boat',
    brandAliases: ['aavante', 'stone', 'airdopes', 'wave'],
    categories: ['earbuds', 'headphones', 'speaker', 'smartwatch'],
    buildSearchUrl: (q) => `https://www.boat-lifestyle.com/search?q=${encodeURIComponent(q)}`,
    enabled: true,
  },
  {
    name: 'JBL',
    kind: 'official',
    brand: 'jbl',
    brandAliases: ['flip', 'charge', 'tune', 'live'],
    categories: ['earbuds', 'headphones', 'speaker'],
    buildSearchUrl: (q) => `https://in.jbl.com/search?q=${encodeURIComponent(q)}`,
    enabled: true,
  },
  {
    name: 'Noise',
    kind: 'official',
    brand: 'noise',
    brandAliases: ['colorfit', 'buds', 'airwave'],
    categories: ['earbuds', 'smartwatch'],
    buildSearchUrl: (q) => `https://www.gonoise.com/search?q=${encodeURIComponent(q)}`,
    enabled: true,
  },
];

function brandMatchesSource(brandInput, modelInput, source) {
  if (!source.brand) return false;
  const lowerBrand = (brandInput || '').toLowerCase().trim();
  const lowerModel = (modelInput || '').toLowerCase().trim();
  const combined = `${lowerBrand} ${lowerModel}`;

  if (source.brand === lowerBrand) return true;
  if (
    source.brandAliases?.some(
      (alias) => combined.includes(alias) || alias.includes(lowerBrand),
    )
  ) {
    return true;
  }
  return false;
}

/**
 * @param {string} [category]
 * @param {string} [brand]
 * @param {string} [model]
 */
export function getSourcesForCategory(category, brand, model) {
  return SOURCES.filter((s) => {
    if (!s.enabled) return false;
    if (category && !s.categories.includes(category)) return false;
    if (brand && s.kind === 'official') {
      return brandMatchesSource(brand, model, s);
    }
    return true;
  });
}

export function getMarketplaces(category) {
  return getSourcesForCategory(category).filter((s) => s.kind === 'marketplace');
}

export function getOfficialStores(category) {
  return getSourcesForCategory(category).filter((s) => s.kind === 'official');
}

export function getAllSourceNames() {
  return SOURCES.filter((s) => s.enabled).map((s) => s.name);
}

export { SOURCES };
