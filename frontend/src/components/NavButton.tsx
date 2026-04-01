import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function NavButton({ icon: Icon, label, to }: { icon: any, label: string, to: string }) {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <button
            onClick={() => navigate(to)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium text-sm ${isActive
                ? 'bg-[var(--color-bg-panel-hover)] text-[var(--color-accent-cyan)] shadow-sm'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-panel-hover)] hover:text-[var(--color-text-primary)]'
                }`}
            aria-label={label}
        >
            <Icon className={`w-5 h-5 ${isActive ? 'text-[var(--color-accent-cyan)]' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)]'}`} />
            <span>{label}</span>
        </button>
    );
}
