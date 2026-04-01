import React, { useState, useEffect } from 'react';
import { Activity, Activity as ActivityIcon, LogIn, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ActivityPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/activity')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch data');
                return res.json();
            })
            .then(items => {
                setData(items);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                toast.error('Failed to load activity feed');
                setLoading(false);
            });
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex-1 p-6 flex flex-col items-center animate-fade-in gap-6"
        >
            <div className="flex flex-col items-center text-center mb-4">
                <div className="w-16 h-16 rounded-full border-2 border-[var(--color-accent-green)] flex items-center justify-center mb-4">
                    <Activity className="w-8 h-8 text-[var(--color-accent-green)]" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Activity History</h2>
                <p className="text-[var(--color-text-secondary)] max-w-md">
                    Recent queries, analysis results, and system logs.
                </p>
            </div>

            {loading ? (
                <div className="animate-pulse flex flex-col gap-4 w-full max-w-2xl">
                    <div className="h-16 bg-[var(--color-bg-panel)] rounded-xl"></div>
                    <div className="h-16 bg-[var(--color-bg-panel)] rounded-xl"></div>
                </div>
            ) : (
                <div className="w-full max-w-2xl space-y-4">
                    {data.map((act, i) => (
                        <div key={i} className="glass-panel p-4 rounded-xl border border-[var(--color-border-subtle)] hover:border-[var(--color-accent-green)] transition-colors flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[var(--color-bg-panel-hover)] flex items-center justify-center">
                                {act.action.includes('Logged') ? <LogIn className="w-5 h-5 text-blue-400" /> : <Search className="w-5 h-5 text-[var(--color-accent-green)]" />}
                            </div>
                            <div className="flex-1 flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-medium text-[var(--color-text-primary)]">{act.action}</h3>
                                    <p className="text-xs text-[var(--color-text-muted)] mt-1 font-mono">{act.target}</p>
                                </div>
                                <span className="text-xs text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)] px-3 py-1 rounded-full">{act.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
