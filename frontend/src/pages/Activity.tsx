import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSearch } from '../context/SearchContext';

export default function ActivityPage() {
  const { recentSearches, clearRecentSearches } = useSearch();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 p-6 max-w-2xl mx-auto w-full pb-16"
    >
      <header className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="ss-eyebrow mb-2">Activity</p>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Recent searches</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Stored on this device only.</p>
        </div>
        {recentSearches.length > 0 ? (
          <button
            type="button"
            onClick={clearRecentSearches}
            className="text-xs font-mono uppercase tracking-wider text-[var(--color-accent-red)] flex items-center gap-1 hover:underline"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        ) : null}
      </header>

      {recentSearches.length === 0 ? (
        <div className="ss-card p-10 text-center text-[var(--color-text-muted)]">
          <p className="mb-4">No recent searches.</p>
          <Link to="/dashboard" className="ss-btn-primary no-underline inline-block text-sm">
            Find a phone
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {recentSearches.map((r) => (
            <li key={r.id} className="ss-card p-4 flex items-start gap-3">
              <Clock className="w-5 h-5 text-[var(--color-accent-cyan)] shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-[var(--color-text-primary)]">{r.label}</p>
                <p className="text-xs font-mono text-[var(--color-text-muted)] mt-1">
                  {new Date(r.at).toLocaleString()}
                </p>
              </div>
              <Link
                to="/dashboard"
                className="text-xs font-mono text-[var(--color-accent-cyan)] hover:underline shrink-0"
              >
                Re-run
              </Link>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
