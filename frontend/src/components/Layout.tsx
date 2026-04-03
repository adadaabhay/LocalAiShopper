import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Zap, TrendingDown, Clock, User as UserIcon, Globe, Smartphone, Menu, X } from 'lucide-react';
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
      <NavButton icon={Smartphone} label="Dashboard" to="/dashboard" />
      <NavButton icon={Globe} label="Market analysis" to="/dashboard/market-analysis" />
      <NavButton icon={TrendingDown} label="Price trends" to="/dashboard/trends" />
      <NavButton icon={Clock} label="Activity" to="/dashboard/activity" />
    </>
  );

  return (
    <div className="flex h-screen text-[var(--color-text-primary)] font-sans overflow-hidden bg-transparent">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(17,24,39,0.95)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border-strong)',
          },
        }}
      />

      <aside className="hidden lg:flex flex-col w-64 h-full ss-card border-r rounded-none border-t-0 border-b-0 border-l-0 flex-shrink-0 z-40">
        <div className="p-6 border-b border-[var(--color-border-subtle)]">
          <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-85 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-cyan)]/15 text-[var(--color-accent-cyan)] flex items-center justify-center border border-[var(--color-accent-cyan)]/25">
              <Zap className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">ShopSense</h1>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="ss-eyebrow px-3 py-2">Navigate</div>
          {navUpper}
        </div>
        <div className="p-4 border-t border-[var(--color-border-subtle)]">
          <NavButton icon={UserIcon} label="Profile" to="/dashboard/profile" />
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
              className="fixed inset-y-0 left-0 w-72 ss-card border-r rounded-none z-50 flex flex-col lg:hidden"
            >
              <div className="p-5 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
                <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <Zap className="w-6 h-6 text-[var(--color-accent-cyan)]" />
                  <span className="font-bold">ShopSense</span>
                </Link>
                <button type="button" className="p-2 text-[var(--color-text-muted)]" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-1">{navUpper}</div>
              <div className="p-4 border-t border-[var(--color-border-subtle)]">
                <NavButton icon={UserIcon} label="Profile" to="/dashboard/profile" />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-10">
        <header className="sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-base)]/75 backdrop-blur-lg">
          <button
            type="button"
            className="p-2 -ml-2 text-[var(--color-text-secondary)] lg:hidden rounded-lg hover:bg-[var(--color-bg-panel-hover)]"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <p className="hidden sm:block text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-widest truncate flex-1 text-center lg:text-left lg:ml-0">
            Variant-aware prices · AI spec scores
          </p>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-[var(--color-border-subtle)] px-3 py-1 text-xs font-mono text-[var(--color-text-muted)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-green)]" />
              Online
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
