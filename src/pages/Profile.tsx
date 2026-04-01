import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Key, Bell, Loader, Palette, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { API_BASE } from '../config';

export default function ProfilePage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        fetch(`${API_BASE}/api/user`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch data');
                return res.json();
            })
            .then(user => {
                setData(user);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                toast.error('Failed to load profile data');
                setLoading(false);
            });
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 p-6 flex flex-col items-center justify-center animate-fade-in gap-6"
        >
            <div className="glass-panel p-8 rounded-2xl border border-[var(--color-border-strong)] flex flex-col items-center text-center w-full max-w-md relative overflow-hidden">

                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-accent-cyan)] to-[var(--color-accent-purple)] opacity-50"></div>

                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-bg-base)] to-[var(--color-bg-panel)] border-2 border-[var(--color-accent-cyan)] flex items-center justify-center mb-6 shadow-xl relative group">
                    <div className="absolute inset-0 rounded-full border border-[var(--color-accent-cyan)]/30 scale-110 animate-pulse"></div>
                    {data ? (
                        <span className="text-3xl font-bold neon-text-cyan">{data.avatar}</span>
                    ) : (
                        <User className="w-10 h-10 text-[var(--color-accent-cyan)]" />
                    )}
                </div>

                {loading ? (
                    <div className="animate-pulse flex flex-col items-center gap-2 mb-8">
                        <div className="h-6 w-32 bg-[var(--color-bg-panel)] rounded-md"></div>
                        <div className="h-4 w-48 bg-[var(--color-bg-panel)] rounded-md"></div>
                    </div>
                ) : (
                    <div className="mb-8 w-full">
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">{data.name}</h2>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-4">{data.email}</p>

                        <div className="flex justify-center gap-4 mt-4 py-4 border-t border-[var(--color-border-subtle)]">
                            <div className="text-center">
                                <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-mono mb-1">Plan</p>
                                <p className={`font-medium ${data?.plan === 'Pro' ? 'neon-text-purple' : 'text-[var(--color-text-primary)]'}`}>{data?.plan || 'Free'}</p>
                            </div>
                            <div className="text-center border-l border-[var(--color-border-subtle)] pl-4">
                                <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-mono mb-1">Member Since</p>
                                <p className="font-medium text-[var(--color-text-primary)]">{data.member_since}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="w-full space-y-3">
                    <button className="w-full flex items-center justify-between p-4 rounded-xl bg-[var(--color-bg-panel)] border border-[var(--color-border-subtle)] hover:border-[var(--color-accent-cyan)] transition-colors group">
                        <div className="flex items-center gap-3">
                            <Key className="w-5 h-5 text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent-cyan)]" />
                            <span className="text-sm text-[var(--color-text-primary)] font-medium">API Keys</span>
                        </div>
                        <span className="text-xs font-mono text-[var(--color-text-muted)]">Manage</span>
                    </button>

                    <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-[var(--color-bg-panel)] border border-[var(--color-border-subtle)] hover:border-[var(--color-accent-purple)] transition-colors group text-left">
                        <Shield className="w-5 h-5 text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent-purple)]" />
                        <span className="text-sm text-[var(--color-text-primary)] font-medium">Privacy & Security</span>
                    </button>

                    <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-[var(--color-bg-panel)] border border-[var(--color-border-subtle)] hover:border-[var(--color-text-secondary)] transition-colors group text-left">
                        <Settings className="w-5 h-5 text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]" />
                        <span className="text-sm text-[var(--color-text-primary)] font-medium">Preferences</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
