import { motion } from 'framer-motion';
import { Zap, ChevronRight, BarChart3, TrendingDown, Smartphone, Laptop, Tablet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-12 text-[var(--color-text-primary)]">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl flex items-center justify-between mb-16"
      >
        <div className="flex items-center gap-2">
          <Zap className="w-7 h-7 text-[var(--color-accent-cyan)]" />
          <span className="font-bold tracking-tight text-lg">ShopSense</span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="text-xs font-mono uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-accent-cyan)]"
        >
          Dashboard →
        </button>
      </motion.header>

      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="w-full max-w-3xl flex-1 flex flex-col items-center text-center"
      >
        <p className="ss-eyebrow mb-4">Product finder</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight max-w-xl">
          Phones. Laptops. Tablets. One engine.
        </h1>
        <p className="mt-6 text-[var(--color-text-secondary)] max-w-lg leading-relaxed">
          Discover available variants across 15+ stores and brand sites, pick your spec, then get deep AI-powered
          analysis with live prices, benchmarks, and a six-month price curve.
        </p>

        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="mt-10 ss-btn-primary inline-flex items-center gap-2 text-base px-8 py-3.5"
        >
          <Zap className="w-5 h-5" />
          Start finding
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="mt-20 grid sm:grid-cols-3 gap-4 w-full max-w-2xl text-left">
          {[
            {
              icon: Smartphone,
              t: 'Multi-category',
              d: 'Phones, laptops, tablets — one search flow with category-specific scoring.',
            },
            {
              icon: BarChart3,
              t: 'Variant discovery',
              d: 'Auto-detect RAM, storage, and processor combos from 15+ sources.',
            },
            {
              icon: TrendingDown,
              t: 'Deep analysis',
              d: 'AI benchmarks, price trends, and alternatives in your budget.',
            },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="ss-card p-4">
              <Icon className="w-5 h-5 text-[var(--color-accent-cyan)] mb-2" />
              <p className="font-semibold text-sm">{t}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-3 justify-center flex-wrap">
          {[
            { icon: Smartphone, label: 'Phones', brands: 'Samsung · Apple · OnePlus · Xiaomi · Vivo' },
            { icon: Laptop, label: 'Laptops', brands: 'ASUS · Lenovo · HP · Dell · MSI' },
            { icon: Tablet, label: 'Tablets', brands: 'Apple · Samsung · Lenovo · Xiaomi' },
          ].map(({ icon: Icon, label, brands }) => (
            <div key={label} className="ss-card p-3 text-center min-w-[140px]">
              <Icon className="w-4 h-4 text-[var(--color-accent-cyan)] mx-auto mb-1" />
              <p className="text-xs font-semibold">{label}</p>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{brands}</p>
            </div>
          ))}
        </div>
      </motion.main>

      <footer className="mt-16 text-[10px] font-mono uppercase tracking-widest text-[var(--color-text-muted)]">
        Scores are advisory · verify before purchase
      </footer>
    </div>
  );
}
