import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Loader2, Search, ShieldCheck, Sparkles, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSearch } from '../context/SearchContext';

export default function AnalysisPage() {
  const navigate = useNavigate();
  const { draft, phoneAdvice, setPhoneAdvice, addRecentSearch } = useSearch();
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    if (!draft.brand.trim() || !draft.model.trim()) {
      toast.error('Complete the search page first.');
      navigate('/dashboard/search');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/phone/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: draft.brand.trim(),
          model: draft.model.trim(),
          ram: draft.ram,
          storage: draft.storage,
          category: draft.category,
          directUrl: draft.directUrl.trim(),
        }),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Analysis failed.');

      setPhoneAdvice(payload);
      addRecentSearch({
        label: `${draft.brand} ${draft.model} - ${draft.ram}/${draft.storage}${draft.directUrl ? ' (Direct URL)' : ''}`,
        brand: draft.brand.trim(),
        model: draft.model.trim(),
        ram: draft.ram,
        storage: draft.storage,
        category: draft.category,
      });
      toast.success('Analysis complete.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Analysis failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto w-full p-5 sm:p-7 pb-16 space-y-8">
      <header className="grid gap-6 lg:grid-cols-[1fr_0.9fr] items-start">
        <div>
          <p className="ss-eyebrow mb-2">Analysis Chamber</p>
          <h1 className="ss-display text-4xl md:text-5xl font-semibold leading-[0.98]">Turn the selected product into a real buying decision.</h1>
          <p className="mt-4 max-w-2xl text-[var(--color-text-secondary)]">
            This page isolates the full recommendation, pricing posture, and what to do next so it feels focused instead of crowded.
          </p>
        </div>
        <div className="ss-card ss-panel-glow p-5">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Current selection</p>
          <p className="mt-3 text-2xl font-semibold">{draft.brand || 'Brand'} {draft.model || 'Model'}</p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{draft.ram} · {draft.storage}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-[var(--color-border-subtle)] px-3 py-1.5 text-xs font-mono uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Analysis</span>
            <span className="rounded-full border border-[var(--color-border-subtle)] px-3 py-1.5 text-xs font-mono uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Market</span>
            <span className="rounded-full border border-[var(--color-border-subtle)] px-3 py-1.5 text-xs font-mono uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Pricing</span>
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <div className="ss-card ss-panel-glow p-6 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="ss-eyebrow">Run Analysis</p>
              <h2 className="mt-2 text-2xl font-semibold">Generate the recommendation</h2>
            </div>
            <button type="button" onClick={handleAnalyze} disabled={loading} className="ss-btn-primary inline-flex items-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? 'Analyzing...' : phoneAdvice ? 'Refresh analysis' : 'Run analysis'}
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.2rem] border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-hover)]/62 p-4">
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Product</p>
              <p className="mt-2 text-lg font-semibold">{draft.brand || 'Brand'} {draft.model || 'Model'}</p>
            </div>
            <div className="rounded-[1.2rem] border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-hover)]/62 p-4">
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Configuration</p>
              <p className="mt-2 text-lg font-semibold">{draft.ram} / {draft.storage}</p>
            </div>
            <div className="rounded-[1.2rem] border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-hover)]/62 p-4">
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Direct URL</p>
              <p className="mt-2 text-lg font-semibold">{draft.directUrl ? 'Attached' : 'Optional'}</p>
            </div>
          </div>
        </div>

        <div className="ss-card ss-panel-glow p-6 space-y-4">
          <div>
            <p className="ss-eyebrow">What you unlock</p>
            <h2 className="mt-2 text-2xl font-semibold">A fuller dashboard after analysis</h2>
          </div>
          <div className="space-y-3">
            <div className="rounded-[1.2rem] border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-hover)]/55 p-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[var(--color-accent-cyan)]" />
                <div>
                  <p className="font-semibold">Verdict with evidence</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">Get a clear buy stance backed by verified signals.</p>
                </div>
              </div>
            </div>
            <div className="rounded-[1.2rem] border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-hover)]/55 p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-[var(--color-accent-cyan)]" />
                <div>
                  <p className="font-semibold">Market analysis page</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">Explore deeper benchmark and scoring breakdowns.</p>
                </div>
              </div>
            </div>
            <div className="rounded-[1.2rem] border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-hover)]/55 p-4">
              <div className="flex items-center gap-3">
                <TrendingDown className="w-5 h-5 text-[var(--color-accent-cyan)]" />
                <div>
                  <p className="font-semibold">Price analysis page</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">Use the price page to judge timing, not just value.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {!phoneAdvice ? (
        <section className="ss-card ss-panel-glow p-10 text-center">
          <Sparkles className="w-12 h-12 mx-auto text-[var(--color-accent-cyan)]" />
          <p className="mt-5 text-2xl font-semibold">No analysis yet</p>
          <p className="mt-3 max-w-2xl mx-auto text-[var(--color-text-secondary)]">
            Run the selected product through the analysis engine here. After that, this page will hold the executive recommendation while the deeper pages handle market and pricing detail.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={handleAnalyze} disabled={loading} className="ss-btn-primary inline-flex items-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Start analysis
            </button>
            <Link to="/dashboard/search" className="ss-btn-ghost">Back to search</Link>
          </div>
        </section>
      ) : (
        <section className="space-y-6">
          <div className="ss-card ss-panel-glow p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="ss-eyebrow">Executive Recommendation</p>
                <h2 className="mt-2 text-3xl font-semibold">{phoneAdvice.selectedVariant.brand} {phoneAdvice.selectedVariant.model}</h2>
                <p className="mt-3 max-w-3xl text-[var(--color-text-secondary)]">{phoneAdvice.insight}</p>
              </div>
              <div className="rounded-[1.2rem] border border-[var(--color-accent-cyan)]/40 bg-[var(--color-accent-cyan)]/10 px-4 py-3">
                <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Buy verdict</p>
                <p className="mt-2 text-lg font-semibold text-[var(--color-accent-soft)]">{phoneAdvice.buyVerdict}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="ss-card p-5">
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Best price</p>
              <p className="mt-2 text-3xl font-semibold">{phoneAdvice.pricing.bestPriceLabel}</p>
            </div>
            <div className="ss-card p-5">
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Median</p>
              <p className="mt-2 text-3xl font-semibold">{phoneAdvice.pricing.medianPriceLabel}</p>
            </div>
            <div className="ss-card p-5">
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Live offers</p>
              <p className="mt-2 text-3xl font-semibold">{phoneAdvice.pricing.totalOffers}</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
            <div className="ss-card ss-panel-glow p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="ss-eyebrow">Offer Snapshot</p>
                  <h3 className="mt-2 text-2xl font-semibold">Current listing highlights</h3>
                </div>
                <Link to="/dashboard/market-analysis" className="ss-btn-ghost inline-flex items-center gap-2">
                  Market analysis
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="mt-5 space-y-3">
                {phoneAdvice.offers.slice(0, 4).map((offer) => (
                  <div key={`${offer.store}-${offer.title}`} className="rounded-[1.15rem] border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-hover)]/60 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <p className="font-semibold">{offer.store}</p>
                        <p className="text-sm text-[var(--color-text-secondary)]">{offer.title}</p>
                      </div>
                      <p className="text-lg font-semibold text-[var(--color-accent-soft)]">{offer.priceLabel}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ss-card ss-panel-glow p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="ss-eyebrow">Next Pages</p>
                  <h3 className="mt-2 text-2xl font-semibold">Continue the deeper read</h3>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <Link to="/dashboard/market-analysis" className="ss-btn-ghost w-full justify-between">
                  Market analysis
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/dashboard/trends" className="ss-btn-ghost w-full justify-between">
                  Price analysis
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/dashboard/search" className="ss-btn-ghost w-full justify-between">
                  Refine search
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </motion.div>
  );
}
