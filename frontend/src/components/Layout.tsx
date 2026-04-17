import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Zap, TrendingDown, Clock, Globe, Smartphone, Menu, X, Sparkles, ShieldCheck } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import NavButton from './NavButton';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navUpper = (
    <>
      <NavButton icon={Smartphone} label="Product select" to="/dashboard" />
      <NavButton icon={Sparkles} label="Search workspace" to="/dashboard/search" />
      <NavButton icon={Zap} label="Analysis" to="/dashboard/analysis" />
      <NavButton icon={Globe} label="Market analysis" to="/dashboard/market-analysis" />
      <NavButton icon={TrendingDown} label="Price analysis" to="/dashboard/trends" />
      <NavButton icon={Clock} label="Activity" to="/dashboard/activity" />
    </>
  );

  return (
    <div className="flex h-screen text-[var(--color-text-primary)] font-sans overflow-hidden bg-transparent">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(14,14,14,0.96)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border-strong)',
            borderRadius: '18px',
          },
        }}
      />

      <aside className="hidden lg:flex flex-col w-80 h-full ss-card ss-panel-glow border-r rounded-none border-t-0 border-b-0 border-l-0 flex-shrink-0 z-40">
        <div className="p-6 border-b border-[var(--color-border-subtle)]">
          <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-85 transition-opacity">
            <div className="w-12 h-12 rounded-[1.1rem] bg-[linear-gradient(135deg,rgba(229,9,20,0.22),rgba(127,29,29,0.16))] text-[var(--color-accent-cyan)] flex items-center justify-center border border-[var(--color-accent-cyan)]/35 shadow-[0_0_40px_rgba(185,28,28,0.35)]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">LocalAiShopper</h1>
              <p className="text-[11px] text-[var(--color-text-muted)] font-mono uppercase tracking-[0.22em]">Premier buying desk</p>
            </div>
          </Link>
        </div>

        <div className="px-6 pt-6">
          <div className="rounded-[1.4rem] border border-[var(--color-border-subtle)] bg-[linear-gradient(135deg,rgba(54,12,15,0.64),rgba(20,20,20,0.96))] px-4 py-4">
            <p className="ss-eyebrow">Private Market View</p>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">A focused decision workspace for live pricing, verified review confidence, and cleaner buying calls.</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pt-5 space-y-1">
          <div className="ss-eyebrow px-3 py-2">Navigation</div>
          {navUpper}
        </div>

        <div className="p-4 border-t border-[var(--color-border-subtle)]">
          <div className="rounded-[1.2rem] border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-hover)]/72 px-4 py-4">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-accent-cyan)]" />
              System state
            </div>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Live scraping and review validation are active.</p>
          </div>
        </div>
      </aside>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/55 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
              className="fixed inset-y-0 left-0 w-80 ss-card border-r rounded-none z-50 flex flex-col lg:hidden"
            >
              <div className="p-5 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
                <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <Zap className="w-6 h-6 text-[var(--color-accent-cyan)]" />
                  <span className="font-bold">LocalAiShopper</span>
                </Link>
                <button type="button" className="p-2 text-[var(--color-text-muted)]" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-1">{navUpper}</div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-10">
        <header className="sticky top-0 z-30 px-4 sm:px-6 py-4 flex items-center justify-between border-b border-[var(--color-border-subtle)] bg-[rgba(7,7,7,0.82)] backdrop-blur-xl">
          <button
            type="button"
            className="p-2 -ml-2 text-[var(--color-text-secondary)] lg:hidden rounded-lg hover:bg-[var(--color-bg-panel-hover)]"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <p className="hidden sm:block text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-[0.22em] truncate flex-1 text-center lg:text-left lg:ml-0">
            Concierge-grade electronics intelligence
          </p>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-hover)]/55 px-3 py-1.5 text-xs font-mono text-[var(--color-text-muted)]">
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent-cyan)]" />
              Live
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
