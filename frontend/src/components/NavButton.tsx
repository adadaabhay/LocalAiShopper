import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function NavButton({ icon: Icon, label, to }: { icon: any; label: string; to: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <button
      onClick={() => navigate(to)}
      className={`group w-full flex items-center justify-between gap-3 px-3 py-3 rounded-2xl transition-all font-medium text-sm ${
        isActive
          ? 'bg-[linear-gradient(135deg,rgba(127,29,29,0.34),rgba(30,10,12,0.96))] text-[var(--color-text-primary)] shadow-[0_18px_36px_rgba(127,29,29,0.24)] border border-[var(--color-accent-cyan)]/40'
          : 'text-[var(--color-text-secondary)] border border-transparent hover:border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-panel-hover)] hover:text-[var(--color-text-primary)]'
      }`}
      aria-label={label}
    >
      <span className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
          isActive
            ? 'border-[var(--color-accent-cyan)]/35 bg-[var(--color-accent-cyan)]/12 text-[var(--color-accent-cyan)]'
            : 'border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)]'
        }`}>
          <Icon className="w-4.5 h-4.5" />
        </span>
        <span>{label}</span>
      </span>
      <span className={`h-2 w-2 rounded-full transition-all ${isActive ? 'bg-[var(--color-accent-cyan)]' : 'bg-transparent group-hover:bg-[var(--color-border-subtle)]'}`} />
    </button>
  );
}
