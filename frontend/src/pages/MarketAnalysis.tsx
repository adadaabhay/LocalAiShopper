import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Cpu, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSearch } from '../context/SearchContext';

export default function MarketAnalysisPage() {
  const { phoneAdvice } = useSearch();
  const rows = phoneAdvice?.hardwareBenchmarks;

  if (!phoneAdvice || !rows?.length) {
    return (
      <div className="flex-1 p-8 flex flex-col items-center justify-center min-h-[420px] text-center max-w-md mx-auto">
        <Globe className="w-14 h-14 text-[var(--color-text-muted)] mb-4 opacity-40" />
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">No analysis yet</h2>
        <p className="text-[var(--color-text-muted)] mt-2 text-sm">
          Run the phone finder on the dashboard first. We’ll surface detailed hardware benchmarks here.
        </p>
        <Link to="/dashboard" className="mt-6 ss-btn-primary no-underline inline-flex items-center gap-2 text-sm">
          Go to dashboard
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const title = `${phoneAdvice.selectedVariant.brand} ${phoneAdvice.selectedVariant.model}`;
  const sub = `${phoneAdvice.selectedVariant.ram} · ${phoneAdvice.selectedVariant.storage}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 p-6 max-w-4xl mx-auto w-full pb-16"
    >
      <header className="mb-8">
        <p className="ss-eyebrow mb-2">Market analysis</p>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] flex flex-wrap items-center gap-3">
          <Globe className="w-8 h-8 text-[var(--color-accent-cyan)] shrink-0" />
          {title}
        </h1>
        <p className="text-[var(--color-text-muted)] font-mono text-sm mt-1">{sub}</p>
        <p className="mt-4 text-[var(--color-text-secondary)] text-sm max-w-2xl leading-relaxed">{phoneAdvice.insight}</p>
      </header>

      <div className="ss-card p-6 md:p-8 mb-8">
        <h2 className="text-xs font-mono uppercase tracking-widest text-[var(--color-text-muted)] mb-6 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[var(--color-accent-cyan)]" />
          Hardware benchmarks
        </h2>
        <div className="space-y-4">
          {rows.map((row) => (
            <div
              key={row.area}
              className="grid md:grid-cols-[1fr_auto] gap-3 md:gap-6 pb-4 border-b border-[var(--color-border-subtle)] last:border-0 last:pb-0"
            >
              <div>
                <h3 className="font-semibold text-[var(--color-text-primary)]">{row.area}</h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-1 leading-relaxed">{row.detail}</p>
              </div>
              <div className="flex md:flex-col items-center md:items-end gap-2 md:text-right">
                <span className="text-2xl font-black tabular-nums text-[var(--color-accent-cyan)]">
                  {row.score.toFixed(1)}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-text-muted)]">
                  / 10
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/dashboard/trends"
          className="ss-card px-5 py-3 text-sm font-medium inline-flex items-center gap-2 no-underline text-[var(--color-text-primary)]"
        >
          View 6-month price trend
        </Link>
        <Link to="/dashboard" className="text-sm font-mono text-[var(--color-accent-cyan)] hover:underline">
          ← New search
        </Link>
      </div>
    </motion.div>
  );
}
