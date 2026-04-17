import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Radar, ShieldCheck, BadgeIndianRupee, Sparkles, Smartphone, Cpu, Activity, ChevronRight } from 'lucide-react';

const highlights = [
  {
    icon: Radar,
    title: 'Live market read',
    body: 'Track exact seller signals across marketplaces and official stores without losing the variant context.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified confidence layer',
    body: 'Ratings stay disciplined. If evidence is weak, the interface says so instead of pretending certainty.',
  },
  {
    icon: BadgeIndianRupee,
    title: 'Price intelligence',
    body: 'See the best live number, the pricing band, and the buying posture in one decision surface.',
  },
];

const statCards = [
  { value: '14+', label: 'Electronics categories' },
  { value: 'Real-time', label: 'Offer intelligence' },
  { value: 'Mobile-ready', label: 'Responsive control room' },
];

const interactionModes = [
  {
    title: 'Market Desk',
    body: 'A calmer, premium workflow designed to feel like a private analyst desk rather than a generic tool.',
  },
  {
    title: 'Variant Clarity',
    body: 'Every step is built around identifying the exact model, storage, and fit before making the recommendation.',
  },
  {
    title: 'Decision Speed',
    body: 'You move from browse to confidence quickly, with fewer noisy elements and better visual hierarchy.',
  },
];

export default function LandingPage() {
  const [activeMode, setActiveMode] = useState(0);
  const mode = useMemo(() => interactionModes[activeMode], [activeMode]);

  return (
    <div className="min-h-screen text-[var(--color-text-primary)] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_14%_14%,rgba(229,9,20,0.22),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(127,29,29,0.18),transparent_32%),radial-gradient(circle_at_50%_105%,rgba(251,191,36,0.1),transparent_35%)]" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 py-10 md:py-16">
        <section className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 lg:gap-8 items-stretch">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="ss-card ss-panel-glow p-7 sm:p-10 md:p-12 relative overflow-hidden"
          >
            <div className="absolute -top-18 -right-10 h-56 w-56 rounded-full bg-[var(--color-accent-cyan)]/16 blur-3xl pointer-events-none" />
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-hover)]/60 px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent-cyan)]" />
                Flagship Experience
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border-subtle)] px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Built for serious buyers
              </span>
            </div>

            <h1 className="ss-display text-5xl sm:text-6xl md:text-7xl font-semibold leading-[0.95] max-w-4xl tracking-tight">
              Buy with conviction, not clutter.
            </h1>

            <p className="mt-6 text-base md:text-lg text-[var(--color-text-secondary)] max-w-2xl leading-relaxed">
              LocalAiShopper turns live retail listings, verified reviews, and buying signals into a premium electronics decision desk. The experience starts here, then opens into a faster dashboard.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/dashboard" className="ss-btn-primary inline-flex items-center gap-2 px-5 py-3">
                Enter Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#highlights" className="ss-btn-ghost inline-flex items-center gap-2 px-5 py-3">
                Explore Features
              </a>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {statCards.map((stat) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ y: -4 }}
                  className="rounded-[1.3rem] border border-[var(--color-border-subtle)] bg-[linear-gradient(180deg,rgba(32,32,32,0.92),rgba(19,19,19,0.92))] px-5 py-5"
                >
                  <p className="text-2xl font-extrabold text-[var(--color-accent-soft)]">{stat.value}</p>
                  <p className="mt-1 text-xs font-mono uppercase tracking-[0.14em] text-[var(--color-text-muted)]">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="ss-card ss-panel-glow p-6 sm:p-7 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="ss-eyebrow">Preview Panel</p>
                <h2 className="mt-2 text-2xl font-semibold">The decision cockpit</h2>
              </div>
              <div className="rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-hover)]/70 px-3 py-1 text-xs font-mono uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                Live
              </div>
            </div>

            <div className="mt-6 rounded-[1.4rem] border border-[var(--color-border-subtle)] bg-[linear-gradient(180deg,rgba(29,10,13,0.7),rgba(14,14,14,0.96))] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">Current desk focus</p>
                  <p className="mt-1 text-xl font-semibold">Samsung Galaxy S24</p>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Verified sources aligned with live pricing spread.</p>
                </div>
                <div className="rounded-2xl border border-[var(--color-accent-cyan)]/35 bg-[var(--color-accent-cyan)]/12 px-3 py-2 text-right">
                  <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Buy posture</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--color-accent-soft)]">Buy now</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-[1.1rem] border border-[var(--color-border-subtle)] bg-black/20 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">Verified review weight</span>
                    <span className="font-semibold">80%</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-[var(--color-bg-secondary)] overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '80%' }} className="h-full bg-[linear-gradient(90deg,#f43f5e,#e50914)]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[1.1rem] border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-hover)]/72 p-4">
                    <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Best price</p>
                    <p className="mt-2 text-2xl font-semibold">INR 61,999</p>
                  </div>
                  <div className="rounded-[1.1rem] border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-hover)]/72 p-4">
                    <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Signal quality</p>
                    <p className="mt-2 text-2xl font-semibold">High</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[1.3rem] border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-hover)]/55 p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {interactionModes.map((item, index) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setActiveMode(index)}
                    className={`ss-chip ${index === activeMode ? 'ss-chip-active' : ''}`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
              <motion.p
                key={mode.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed"
              >
                {mode.body}
              </motion.p>
            </div>
          </motion.div>
        </section>

        <section id="highlights" className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.07 * index }}
                whileHover={{ y: -6 }}
                className="ss-card ss-panel-glow p-6"
              >
                <div className="w-12 h-12 rounded-2xl bg-[linear-gradient(135deg,rgba(229,9,20,0.2),rgba(127,29,29,0.14))] border border-[var(--color-accent-cyan)]/35 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[var(--color-accent-cyan)]" />
                </div>
                <h3 className="mt-5 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">{item.body}</p>
              </motion.article>
            );
          })}
        </section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 ss-card ss-panel-glow p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
        >
          <div>
            <p className="ss-eyebrow">Ready to begin</p>
            <h2 className="ss-display text-3xl sm:text-4xl font-semibold mt-2">Open the desk and make the call.</h2>
            <p className="mt-2 text-[var(--color-text-secondary)] text-sm sm:text-base max-w-2xl">
              Desktop or phone, the interface stays focused, cinematic, and built for faster decisions.
            </p>
          </div>
          <Link to="/dashboard" className="ss-btn-primary inline-flex items-center gap-2 whitespace-nowrap">
            <Smartphone className="w-4 h-4" />
            Open Smart Finder
          </Link>
        </motion.section>

        <div className="mt-5 flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
          <Activity className="w-3.5 h-3.5 text-[var(--color-accent-cyan)]" />
          Premium UI mode active
          <ChevronRight className="w-3.5 h-3.5" />
          Live interactions enabled
        </div>
      </div>

      <div className="pointer-events-none absolute -bottom-18 -right-14 w-72 h-72 rounded-full bg-[var(--color-accent-cyan)]/16 blur-3xl" />
      <div className="pointer-events-none absolute -top-14 -left-10 w-56 h-56 rounded-full bg-red-700/18 blur-3xl" />
      <div className="pointer-events-none absolute bottom-8 left-[38%] opacity-20">
        <Cpu className="w-28 h-28 text-[var(--color-accent-cyan)]" />
      </div>
    </div>
  );
}
