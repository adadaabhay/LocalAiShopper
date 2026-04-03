import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TrendingDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useSearch } from '../context/SearchContext';

function buildSixMonthSeries(bestPrice: number) {
  const base = Number.isFinite(bestPrice) && bestPrice > 0 ? bestPrice : 45000;
  const now = new Date();
  const points: { label: string; median: number; best: number }[] = [];
  const variance = [0.12, 0.09, 0.07, 0.05, 0.02, 0];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString('en-IN', { month: 'short' });
    const bump = variance[5 - i];
    const median = Math.round(base * (1 + bump));
    const best = Math.round(base * (1 + bump * 0.55));
    points.push({ label, median, best });
  }
  return points;
}

export default function TrendsPage() {
  const { phoneAdvice } = useSearch();
  const bestVal = phoneAdvice?.pricing?.bestPriceValue ?? 0;

  const data = useMemo(() => buildSixMonthSeries(bestVal), [bestVal]);
  const title = phoneAdvice
    ? `${phoneAdvice.selectedVariant.brand} ${phoneAdvice.selectedVariant.model}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 p-6 max-w-4xl mx-auto w-full pb-16"
    >
      <header className="mb-8">
        <p className="ss-eyebrow mb-2">Price trends</p>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] flex items-center gap-3">
          <TrendingDown className="w-8 h-8 text-[var(--color-accent-cyan)]" />
          6-month price analysis
        </h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-2 max-w-xl">
          Indexed to your last scraped best price. Real history can replace this once persistent series are wired.
        </p>
        {title ? (
          <p className="mt-3 text-sm font-mono text-[var(--color-accent-cyan)] tracking-wide">Variant: {title}</p>
        ) : (
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
            Analyze a phone on the dashboard to anchor the chart to a live best price.
          </p>
        )}
      </header>

      {!phoneAdvice ? (
        <div className="ss-card p-10 text-center text-[var(--color-text-muted)]">
          <p className="mb-4">No variant loaded yet.</p>
          <Link to="/dashboard" className="ss-btn-primary no-underline inline-block text-sm">
            Open dashboard
          </Link>
        </div>
      ) : (
        <div className="ss-card p-6 md:p-8">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[var(--color-text-muted)] mb-6">
            Median vs best offer (₹)
          </h2>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gBest" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gMed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#94a3b8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="label" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(17,24,39,0.95)',
                    border: '1px solid rgba(148,163,184,0.2)',
                    borderRadius: '12px',
                  }}
                  labelStyle={{ color: '#f9fafb' }}
                  formatter={(value: number, name: string) => [`₹${value.toLocaleString('en-IN')}`, name === 'best' ? 'Best offer' : 'Median band']}
                />
                <Area type="monotone" dataKey="median" stroke="#94a3b8" fill="url(#gMed)" strokeWidth={2} name="median" />
                <Area type="monotone" dataKey="best" stroke="#f59e0b" fill="url(#gBest)" strokeWidth={2} name="best" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs font-mono text-[var(--color-text-muted)] mt-4">
            Best (orange) is shaped toward your current scrape; median follows a modest uplift curve for comparison.
          </p>
        </div>
      )}
    </motion.div>
  );
}
