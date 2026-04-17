import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, ArrowRight, Camera, Cpu, Gamepad2, Headphones, Laptop, Monitor, PcCase, Smartphone, Sparkles, Speaker, Tablet, Tv, Watch, Wifi } from 'lucide-react';
import type { ProductCategory } from '@ui/constants';
import { categories, categoryLabels } from '@ui/constants';
import { useSearch } from '../context/SearchContext';

const categoryIcons: Record<ProductCategory, React.ElementType> = {
  phone: Smartphone,
  laptop: Laptop,
  tablet: Tablet,
  smartwatch: Watch,
  earbuds: Headphones,
  tv: Tv,
  camera: Camera,
  monitor: Monitor,
  speaker: Speaker,
  console: Gamepad2,
  desktop: PcCase,
  headphones: Headphones,
  gpu: Cpu,
  router: Wifi,
};

const featureCards = [
  {
    title: 'Separated flow',
    body: 'Pick product type first, then search, then analyze. Each page does one job well.',
  },
  {
    title: 'Richer detail',
    body: 'Analysis, market read, price timing, and activity now live in clearer destinations.',
  },
  {
    title: 'Cleaner dashboard',
    body: 'Less clutter on entry, more room for premium visuals and stronger decision focus.',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { resetDraft, recentSearches } = useSearch();

  function handleCategorySelect(category: ProductCategory) {
    resetDraft(category);
    navigate('/dashboard/search');
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto w-full p-5 sm:p-7 pb-16 space-y-8">
      <header className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-start">
        <div>
          <p className="ss-eyebrow mb-2">Dashboard Entry</p>
          <h1 className="ss-display text-4xl md:text-6xl font-semibold leading-[0.95]">Start by choosing the product category.</h1>
          <p className="mt-4 max-w-2xl text-[var(--color-text-secondary)]">
            This first screen is now a clean launchpad. Choose what you want to shop for, then we move you into a dedicated search workspace.
          </p>
        </div>

        <div className="ss-card ss-panel-glow p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--color-accent-cyan)]" />
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--color-text-muted)]">New dashboard flow</p>
          </div>
          <div className="mt-5 space-y-3">
            <div className="rounded-[1.2rem] border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-hover)]/60 px-4 py-4">
              <p className="font-semibold">1. Product selection</p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Choose a category on this page only.</p>
            </div>
            <div className="rounded-[1.2rem] border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-hover)]/60 px-4 py-4">
              <p className="font-semibold">2. Search workspace</p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Search brand, model, and variant without other distractions.</p>
            </div>
            <div className="rounded-[1.2rem] border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-hover)]/60 px-4 py-4">
              <p className="font-semibold">3. Analysis pages</p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Open recommendation, market breakdown, and price timing on separate pages.</p>
            </div>
          </div>
        </div>
      </header>

      <section className="ss-card ss-panel-glow p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <p className="ss-eyebrow">Select Product</p>
            <h2 className="mt-2 text-2xl font-semibold">Choose the department you want to analyze</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-hover)]/55 px-3 py-1.5 text-xs font-mono uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
            <Activity className="w-3.5 h-3.5 text-[var(--color-accent-cyan)]" />
            Entry page only
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((category) => {
            const Icon = categoryIcons[category];
            return (
              <motion.button
                key={category}
                type="button"
                onClick={() => handleCategorySelect(category)}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.98 }}
                className="text-left rounded-[1.4rem] border border-[var(--color-border-subtle)] bg-[linear-gradient(180deg,rgba(28,28,28,0.94),rgba(16,16,16,0.96))] p-5 transition-all hover:border-[var(--color-accent-cyan)]/45 hover:bg-[linear-gradient(180deg,rgba(52,18,20,0.9),rgba(18,18,18,0.96))]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] text-[var(--color-accent-cyan)]">
                  <Icon className="w-5 h-5" />
                </div>
                <p className="mt-5 text-lg font-semibold">{categoryLabels[category]}</p>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Open a dedicated search page for this category.</p>
                <div className="mt-5 inline-flex items-center gap-2 text-sm text-[var(--color-accent-soft)]">
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="ss-card ss-panel-glow p-6">
          <p className="ss-eyebrow">Recent Activity</p>
          <h3 className="mt-2 text-2xl font-semibold">Quick return points</h3>
          {recentSearches.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--color-text-secondary)]">Once you analyze products, your recent searches will show up here for quick relaunch.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {recentSearches.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-[1.2rem] border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-hover)]/55 px-4 py-4">
                  <p className="font-semibold">{item.label}</p>
                  <p className="mt-1 text-xs font-mono text-[var(--color-text-muted)]">{new Date(item.at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {featureCards.map((feature) => (
            <div key={feature.title} className="ss-card ss-panel-glow p-5">
              <p className="text-lg font-semibold">{feature.title}</p>
              <p className="mt-3 text-sm text-[var(--color-text-secondary)]">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
