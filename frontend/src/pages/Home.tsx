import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, BarChart3, TrendingDown, ChevronRight, Search, Smartphone, Laptop, Tablet, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useSearch } from '../context/SearchContext';
import type { PhoneAdvice, DiscoveryResult, DiscoveredVariant } from '@ui/types';
import type { ProductCategory } from '@ui/constants';
import {
  categories,
  categoryLabels,
  getRamOptions,
  getStorageOptions,
  getDefaultBrands,
} from '@ui/constants';

const categoryIcons: Record<ProductCategory, React.ElementType> = {
  phone: Smartphone,
  laptop: Laptop,
  tablet: Tablet,
};

function getBriefLabels(category: ProductCategory) {
  if (category === 'laptop') {
    return [
      { key: 'performance' as const, label: 'Performance' },
      { key: 'display' as const, label: 'Display' },
      { key: 'keyboard' as const, label: 'Keyboard' },
      { key: 'battery' as const, label: 'Battery' },
      { key: 'buildQuality' as const, label: 'Build' },
    ];
  }
  return [
    { key: 'camera' as const, label: 'Camera' },
    { key: 'performance' as const, label: 'Performance' },
    { key: 'durability' as const, label: 'Durability' },
    { key: 'companyService' as const, label: 'Brand service' },
    { key: 'battery' as const, label: 'Battery' },
  ];
}

function formatPrice(val: number | null) {
  if (!val) return '—';
  return `₹${val.toLocaleString('en-IN')}`;
}

type WizardStep = 'search' | 'variants' | 'analyze';

export default function Home() {
  const { setPhoneAdvice, addRecentSearch } = useSearch();

  // ── Wizard state ──────────────────────────────────────────────────
  const [step, setStep] = useState<WizardStep>('search');
  const [category, setCategory] = useState<ProductCategory>('phone');
  const [brand, setBrand] = useState(getDefaultBrands('phone')[0]);
  const [model, setModel] = useState('Galaxy S24');

  // ── Discovery (Phase 1) ───────────────────────────────────────────
  const [discovering, setDiscovering] = useState(false);
  const [discovery, setDiscovery] = useState<DiscoveryResult | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<DiscoveredVariant | null>(null);

  // ── Analysis (Phase 2) ────────────────────────────────────────────
  const [ram, setRam] = useState('8GB');
  const [storage, setStorage] = useState('256GB');
  const [budget, setBudget] = useState(50000);
  const [manualPrice, setManualPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PhoneAdvice | null>(null);

  // ── Handlers ──────────────────────────────────────────────────────

  function handleCategoryChange(cat: ProductCategory) {
    setCategory(cat);
    setBrand(getDefaultBrands(cat)[0]);
    setModel('');
    setRam(getRamOptions(cat)[0]);
    setStorage(getStorageOptions(cat)[1] || getStorageOptions(cat)[0]);
    setDiscovery(null);
    setSelectedVariant(null);
    setResult(null);
    setStep('search');
  }

  async function handleDiscover(e: React.FormEvent) {
    e.preventDefault();
    if (!brand.trim() || !model.trim()) {
      toast.error('Enter brand and model.');
      return;
    }
    setDiscovering(true);
    setDiscovery(null);
    setSelectedVariant(null);
    setResult(null);

    try {
      const res = await fetch('/api/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand: brand.trim(), model: model.trim(), category }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Discovery failed.');
      setDiscovery(payload as DiscoveryResult);
      setStep('variants');
      if (payload.variants?.length) {
        toast.success(`Found ${payload.variants.length} variant(s) across ${payload.sources?.length || 0} sources.`);
      } else {
        toast('No variants auto-detected. You can enter specs manually below.', { icon: '📋' });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Request failed.';
      toast.error(msg);
      // Fall through to variants step so user can enter manually
      setStep('variants');
    } finally {
      setDiscovering(false);
    }
  }

  function handlePickVariant(v: DiscoveredVariant) {
    setSelectedVariant(v);
    setRam(v.ram);
    setStorage(v.storage);
    if (v.priceRange.min) {
      setBudget(Math.round(v.priceRange.min * 1.1));
    }
  }

  function handleProceedToAnalyze() {
    setStep('analyze');
  }

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!brand.trim() || !model.trim()) {
      toast.error('Enter brand and model.');
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/phone/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: brand.trim(),
          model: model.trim(),
          ram,
          storage,
          budget,
          manualPrice,
          category,
        }),
      });
      const payload = (await res.json()) as PhoneAdvice & { error?: string };
      if (!res.ok) throw new Error(payload.error || 'Analysis failed.');
      setResult(payload);
      setPhoneAdvice(payload);
      addRecentSearch({
        label: `${brand} ${model} · ${ram} / ${storage}`,
        brand: brand.trim(),
        model: model.trim(),
        ram,
        storage,
        category,
      });
      toast.success('Analysis complete — see scores below.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Request failed.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  const brief = result?.briefScores;
  const briefLabels = getBriefLabels(category);
  const CategoryIcon = categoryIcons[category];

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full">
      <header className="mb-8">
        <p className="ss-eyebrow mb-2">Product finder</p>
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] tracking-tight max-w-2xl">
          Search. Discover variants. Get spec scores.
        </h1>
        <p className="mt-2 text-[var(--color-text-muted)] max-w-xl">
          Two-step flow: discover available variants first, then pick one for deep AI-powered analysis with live prices.
        </p>
      </header>

      {/* ── Category toggle ── */}
      <div className="flex gap-2 mb-6">
        {categories.map((cat) => {
          const Icon = categoryIcons[cat];
          const active = cat === category;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
              className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all
                ${active
                  ? 'bg-[var(--color-accent-cyan)] text-[var(--color-bg-primary)] shadow-md shadow-[var(--color-accent-cyan)]/25'
                  : 'ss-card hover:border-[var(--color-accent-cyan)]/40 text-[var(--color-text-secondary)]'}
              `}
            >
              <Icon className="w-4 h-4" />
              {categoryLabels[cat]}
            </button>
          );
        })}
      </div>

      {/* ── Step indicator ── */}
      <div className="flex items-center gap-3 mb-6 text-xs font-mono uppercase tracking-widest text-[var(--color-text-muted)]">
        <span className={step === 'search' ? 'text-[var(--color-accent-cyan)]' : ''}>
          1 · Search
        </span>
        <ChevronRight className="w-3 h-3" />
        <span className={step === 'variants' ? 'text-[var(--color-accent-cyan)]' : ''}>
          2 · Pick variant
        </span>
        <ChevronRight className="w-3 h-3" />
        <span className={step === 'analyze' ? 'text-[var(--color-accent-cyan)]' : ''}>
          3 · Analyze
        </span>
      </div>

      {/* ═══ STEP 1: SEARCH ═══ */}
      <AnimatePresence mode="wait">
        {step === 'search' && (
          <motion.section
            key="search"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="ss-card p-6 md:p-8 mb-8"
          >
            <h2 className="text-sm font-mono uppercase tracking-widest text-[var(--color-text-muted)] mb-6 flex items-center gap-2">
              <CategoryIcon className="w-4 h-4 text-[var(--color-accent-cyan)]" />
              Search {categoryLabels[category]}
            </h2>
            <form onSubmit={handleDiscover} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="grid gap-2 text-xs font-mono uppercase tracking-wider text-[var(--color-text-muted)]">
                Brand
                <input
                  className="ss-input"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder={getDefaultBrands(category)[0]}
                  list="brand-suggestions"
                />
                <datalist id="brand-suggestions">
                  {getDefaultBrands(category).map((b) => (
                    <option key={b} value={b} />
                  ))}
                </datalist>
              </label>
              <label className="grid gap-2 text-xs font-mono uppercase tracking-wider text-[var(--color-text-muted)]">
                Model
                <input
                  className="ss-input"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder={category === 'laptop' ? 'ROG Strix G16' : category === 'tablet' ? 'Tab S9' : 'Galaxy S24'}
                />
              </label>
              <div className="sm:col-span-2 flex flex-wrap gap-3 items-end">
                <button
                  type="submit"
                  disabled={discovering}
                  className="ss-btn-primary inline-flex items-center gap-2"
                >
                  {discovering ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  {discovering ? 'Discovering variants…' : 'Discover variants'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep('variants');
                    setDiscovery(null);
                  }}
                  className="text-sm font-mono text-[var(--color-text-muted)] hover:text-[var(--color-accent-cyan)] transition-colors"
                >
                  Skip → enter specs manually
                </button>
              </div>
            </form>
          </motion.section>
        )}

        {/* ═══ STEP 2: PICK VARIANT ═══ */}
        {step === 'variants' && (
          <motion.section
            key="variants"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-8 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-mono uppercase tracking-widest text-[var(--color-text-muted)] flex items-center gap-2">
                <CategoryIcon className="w-4 h-4 text-[var(--color-accent-cyan)]" />
                {discovery?.variants?.length
                  ? `${discovery.variants.length} variant(s) found for "${brand} ${model}"`
                  : `Enter ${categoryLabels[category].toLowerCase()} specs`}
              </h2>
              <button
                type="button"
                onClick={() => { setStep('search'); setResult(null); }}
                className="text-xs font-mono text-[var(--color-text-muted)] hover:text-[var(--color-accent-cyan)]"
              >
                ← Back to search
              </button>
            </div>

            {discovery?.sources?.length ? (
              <p className="text-xs text-[var(--color-text-muted)]">
                Sources checked: {discovery.sources.join(', ')} ({discovery.totalSourcesTried} total)
              </p>
            ) : null}

            {/* Discovered variant cards */}
            {discovery?.variants?.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {discovery.variants.map((v, i) => {
                  const isSelected = selectedVariant === v;
                  return (
                    <motion.button
                      key={`${v.ram}-${v.storage}-${v.processor || i}`}
                      type="button"
                      onClick={() => handlePickVariant(v)}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`
                        ss-card p-4 text-left transition-all cursor-pointer relative
                        ${isSelected
                          ? 'border-[var(--color-accent-cyan)] shadow-md shadow-[var(--color-accent-cyan)]/15'
                          : 'hover:border-[var(--color-accent-cyan)]/40'}
                      `}
                    >
                      {isSelected && (
                        <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-[var(--color-accent-cyan)]" />
                      )}
                      <p className="font-bold text-[var(--color-text-primary)]">
                        {v.ram} / {v.storage}
                      </p>
                      {v.processor && (
                        <p className="text-xs text-[var(--color-accent-cyan)] mt-1">{v.processor}</p>
                      )}
                      <div className="mt-2 flex items-baseline gap-2">
                        {v.priceRange.min ? (
                          <span className="text-sm font-mono text-[var(--color-accent-cyan)]">
                            {formatPrice(v.priceRange.min)}
                          </span>
                        ) : (
                          <span className="text-sm text-[var(--color-text-muted)]">Price N/A</span>
                        )}
                        {v.priceRange.max && v.priceRange.max !== v.priceRange.min ? (
                          <span className="text-xs text-[var(--color-text-muted)]">
                            – {formatPrice(v.priceRange.max)}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                        {v.sourceCount} source{v.sourceCount !== 1 ? 's' : ''}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            ) : null}

            {/* Manual spec entry */}
            <div className="ss-card p-6">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--color-text-muted)] mb-4">
                {discovery?.variants?.length ? 'Or override specs manually' : 'Enter specs'}
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <label className="grid gap-2 text-xs font-mono uppercase tracking-wider text-[var(--color-text-muted)]">
                  RAM
                  <select className="ss-select" value={ram} onChange={(e) => setRam(e.target.value)}>
                    {getRamOptions(category).map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-xs font-mono uppercase tracking-wider text-[var(--color-text-muted)]">
                  Storage
                  <select className="ss-select" value={storage} onChange={(e) => setStorage(e.target.value)}>
                    {getStorageOptions(category).map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-xs font-mono uppercase tracking-wider text-[var(--color-text-muted)]">
                  Budget (INR)
                  <input
                    className="ss-input"
                    type="number"
                    min={0}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value) || 0)}
                  />
                </label>
                <label className="grid gap-2 text-xs font-mono uppercase tracking-wider text-[var(--color-text-muted)]">
                  Manual price (opt.)
                  <input
                    className="ss-input"
                    type="number"
                    min={0}
                    value={manualPrice || ''}
                    placeholder="0"
                    onChange={(e) => setManualPrice(Number(e.target.value) || 0)}
                  />
                </label>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleProceedToAnalyze}
                  className="ss-btn-primary inline-flex items-center gap-2"
                >
                  Analyze {brand} {model} · {ram}/{storage}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.section>
        )}

        {/* ═══ STEP 3: ANALYZE ═══ */}
        {step === 'analyze' && (
          <motion.section
            key="analyze"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-8 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-mono uppercase tracking-widest text-[var(--color-text-muted)]">
                Analyzing: {brand} {model} · {ram}/{storage}
              </h2>
              <button
                type="button"
                onClick={() => { setStep('variants'); setResult(null); }}
                className="text-xs font-mono text-[var(--color-text-muted)] hover:text-[var(--color-accent-cyan)]"
              >
                ← Change variant
              </button>
            </div>

            {/* Auto-trigger analysis */}
            {!result && !loading && (
              <form onSubmit={handleAnalyze}>
                <button type="submit" className="ss-btn-primary inline-flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Run deep analysis
                </button>
              </form>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-[var(--color-text-secondary)]">
                <Loader2 className="w-10 h-10 text-[var(--color-accent-cyan)] animate-spin" />
                <p className="font-mono text-sm">
                  Scraping {category} listings from 15+ sources and running the advisor…
                </p>
              </div>
            )}

            {result && brief && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="ss-eyebrow">Brief spec scores /10</h2>
                    <span className="text-[10px] font-mono text-[var(--color-accent-cyan)] border border-[var(--color-accent-cyan)]/30 bg-[var(--color-accent-cyan)]/10 px-2 py-1 rounded-full uppercase tracking-widest">Official Sources Verified</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {briefLabels.map(({ key, label }) => (
                      <div key={key} className="ss-card p-4 text-center">
                        <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
                          {label}
                        </p>
                        <p className="ss-score-ring text-3xl font-black text-[var(--color-accent-cyan)]">
                          {((brief as Record<string, number>)[key] ?? 0).toFixed(1)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {result.alternatives?.length > 0 && result.buyVerdict !== 'Buy now' && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="mt-6 p-4 rounded-xl border border-green-500/30 bg-green-500/10 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <h3 className="font-bold text-green-500">Better Alternative Recommended</h3>
                        </div>
                        <p className="text-sm text-[var(--color-text-secondary)]">Based on your {formatPrice(budget)} budget, the <strong className="text-[var(--color-text-primary)]">{result.alternatives[0].model}</strong> offers better value. {result.alternatives[0].why}</p>
                      </div>
                      <span className="text-sm font-mono text-green-500 whitespace-nowrap">{result.alternatives[0].estimatedPriceLabel}</span>
                    </motion.div>
                  )}

                  <p className="mt-6 text-[var(--color-text-secondary)] text-sm max-w-2xl leading-relaxed">{result.insight}</p>
                  <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-cyan)]/10 px-3 py-1 text-xs font-mono text-[var(--color-accent-cyan)] border border-[var(--color-accent-cyan)]/25">
                    Verdict: {result.buyVerdict}
                  </p>
                </section>

                {result.hardwareBenchmarks?.length ? (
                  <section className="ss-card p-6">
                    <h3 className="ss-eyebrow mb-6">Deep Hardware Benchmarks (Nanoreview-style)</h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={result.hardwareBenchmarks} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                          <XAxis type="number" domain={[0, 10]} hide />
                          <YAxis dataKey="area" type="category" width={140} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                          <Tooltip
                            cursor={{ fill: 'var(--color-bg-secondary)' }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)] p-3 rounded-lg shadow-xl max-w-xs">
                                    <p className="font-bold text-[var(--color-text-primary)] text-sm mb-1">{data.area}</p>
                                    <p className="text-2xl font-black text-[var(--color-accent-cyan)] mb-2">{data.score}/10</p>
                                    <p className="text-xs text-[var(--color-text-secondary)]">{data.detail}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                            {result.hardwareBenchmarks.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.score >= 8 ? '#10b981' : entry.score >= 6 ? 'var(--color-accent-cyan)' : '#f59e0b'} />
                            ))}
                          </Bar>
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </div>
                  </section>
                ) : null}

                <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="ss-card p-5">
                    <p className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest">Best price</p>
                    <p className="text-2xl font-bold mt-1">{result.pricing.bestPriceLabel}</p>
                  </div>
                  <div className="ss-card p-5">
                    <p className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest">Median</p>
                    <p className="text-2xl font-bold mt-1">{result.pricing.medianPriceLabel}</p>
                  </div>
                  <div className="ss-card p-5">
                    <p className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest">Offers</p>
                    <p className="text-2xl font-bold mt-1">{result.pricing.totalOffers}</p>
                  </div>
                </section>

                <section className="flex flex-wrap gap-3">
                  <Link
                    to="/dashboard/market-analysis"
                    className="ss-card px-5 py-3 inline-flex items-center gap-2 text-sm font-semibold hover:border-[var(--color-accent-cyan)]/40 transition-colors"
                  >
                    <BarChart3 className="w-5 h-5 text-[var(--color-accent-cyan)]" />
                    Deeper hardware benchmarks
                  </Link>
                  <Link
                    to="/dashboard/trends"
                    className="ss-card px-5 py-3 inline-flex items-center gap-2 text-sm font-semibold hover:border-[var(--color-accent-cyan)]/40 transition-colors"
                  >
                    <TrendingDown className="w-5 h-5 text-[var(--color-accent-cyan)]" />
                    6-month price trend
                  </Link>
                </section>

                {result.offers?.length ? (
                  <section>
                    <h3 className="ss-eyebrow mb-3">Live offers (snapshot)</h3>
                    <div className="space-y-2">
                      {result.offers.slice(0, 8).map((o) => (
                        <a
                          key={`${o.store}-${o.title}-${o.priceLabel}`}
                          href={o.url || undefined}
                          target="_blank"
                          rel="noreferrer"
                          className="ss-card flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 p-4 hover:border-[var(--color-accent-cyan)]/40 transition-colors"
                        >
                          <div>
                            <p className="font-semibold text-[var(--color-text-primary)]">
                              {o.store} · {o.sourceType}
                            </p>
                            <p className="text-sm text-[var(--color-text-muted)]">{o.title}</p>
                            {o.variantMatchMode && (
                              <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                                Match: {o.variantMatchMode}
                                {o.variantConfirmed ? ' ✓ confirmed' : ''}
                              </p>
                            )}
                          </div>
                          <span className="font-mono text-[var(--color-accent-cyan)] whitespace-nowrap">{o.priceLabel}</span>
                        </a>
                      ))}
                    </div>
                  </section>
                ) : null}

                {result.alternatives?.length ? (
                  <section>
                    <h3 className="ss-eyebrow mb-3">Alternatives</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {result.alternatives.map((alt) => (
                        <div key={alt.model} className="ss-card p-4">
                          <p className="font-semibold text-sm">{alt.model}</p>
                          <p className="text-xs text-[var(--color-text-muted)] mt-1">{alt.why}</p>
                          <p className="text-sm font-mono text-[var(--color-accent-cyan)] mt-1">{alt.estimatedPriceLabel}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}

                {result.cautions?.length ? (
                  <section className="ss-card p-5 border-yellow-500/20">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-yellow-500 mb-2">Cautions</h3>
                    <ul className="text-sm text-[var(--color-text-secondary)] space-y-1">
                      {result.cautions.map((c) => (
                        <li key={c}>• {c}</li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </motion.div>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
