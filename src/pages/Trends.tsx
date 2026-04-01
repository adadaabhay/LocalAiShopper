import React, { useState, useEffect } from 'react';
import { ArrowDownRight, ArrowUpRight, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function TrendsPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/trends')
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
                toast.error('Failed to load trends');
                setLoading(false);
            });
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex-1 p-6 flex flex-col items-center animate-fade-in gap-6"
        >
            <div className="flex flex-col items-center text-center mb-4">
                <div className="w-16 h-16 rounded-full border-2 border-[var(--color-accent-green)] flex items-center justify-center mb-4">
                    <TrendingDown className="w-8 h-8 text-[var(--color-accent-green)]" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Market Trends</h2>
                <p className="text-[var(--color-text-secondary)] max-w-md">
                    Analyze price drops and seasonal sales by keyword.
                </p>
            </div>

            {loading ? (
                <div className="animate-pulse flex flex-col gap-4 w-full max-w-2xl">
                    <div className="h-16 bg-[var(--color-bg-panel)] rounded-xl"></div>
                    <div className="h-16 bg-[var(--color-bg-panel)] rounded-xl"></div>
                    <div className="h-16 bg-[var(--color-bg-panel)] rounded-xl"></div>
                </div>
            ) : (
                <div className="w-full max-w-2xl space-y-4">
                    {data.map((trend, i) => (
                        <div key={i} className="glass-panel p-4 rounded-xl border border-[var(--color-border-subtle)] hover:border-[var(--color-accent-green)] transition-colors flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-[var(--color-text-primary)] mb-1">{trend.keyword}</h3>
                                <p className="text-xs text-[var(--color-text-muted)]">Volume: <span className="text-[var(--color-text-secondary)]">{trend.volume}</span></p>
                            </div>
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-bg-panel-hover)]">
                                {trend.direction === 'Up' && <TrendingUp className="w-5 h-5 text-red-400" />}
                                {trend.direction === 'Down' && <TrendingDown className="w-5 h-5 text-green-400" />}
                                {trend.direction === 'Stable' && <Minus className="w-5 h-5 text-blue-400" />}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
