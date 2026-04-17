import type { ProductCategory } from './constants';

export type BriefScores = {
  // Mobile scores
  camera?: number;
  performance: number;
  durability?: number;
  companyService?: number;
  battery: number;
  // Laptop scores
  display?: number;
  keyboard?: number;
  buildQuality?: number;
  // Generic electronics scores
  value?: number;
  brandSupport?: number;
};

export type HardwareBenchmark = {
  area: string;
  score: number;
  detail: string;
};

export type DiscoveredVariant = {
  ram: string;
  storage: string;
  processor: string | null;
  url?: string;
  priceRange: {
    min: number | null;
    max: number | null;
  };
  sourceCount: number;
  sources: string[];
};

export type DiscoveryResult = {
  query: string;
  category: ProductCategory;
  variants: DiscoveredVariant[];
  sources: string[];
  sourcesTried: string[];
  totalSourcesTried: number;
  fetchedAt: string;
};

export type PhoneAdvice = {
  provider: string;
  category?: ProductCategory;
  query: string;
  insight: string;
  buyVerdict: string;
  briefScores?: BriefScores;
  hardwareBenchmarks?: HardwareBenchmark[];
  trend?: {
    bestTrend: { direction: string; pct: number | null };
    medianTrend: { direction: string; pct: number | null };
    persistence?: 'memory' | 'file';
  };
  selectedVariant: {
    brand: string;
    model: string;
    ram: string;
    storage: string;
    budget: number;
  };
  pricing: {
    bestPriceValue?: number;
    medianPriceValue?: number;
    bestPriceLabel: string;
    medianPriceLabel: string;
    totalOffers: number;
    fetchedAt: string;
  };
  benchmarks: Array<{ metric: string; score: number; note: string }>;
  offers: Array<{
    store: string;
    sourceType: string;
    title: string;
    priceLabel: string;
    ram: string;
    storage: string;
    processor?: string | null;
    url: string;
    confidence: string;
    variantMatchMode?: 'strict' | 'partial' | 'unknown';
    variantConfirmed?: boolean;
  }>;
  alternatives: Array<{ model: string; why: string; estimatedPriceLabel: string }>;
  cautions: string[];
  reviews?: {
    averageScore10: number | null;
    verifiedSourceCount: number;
    sources: Array<{
      source: string;
      score10: number;
      evidenceType: 'structured' | 'text';
      verified: boolean;
      url: string;
    }>;
    blendPolicy: string;
  };
};
