import React, { useState, useEffect } from 'react';
import { ShieldAlert, Bell, AlertTriangle, ArrowDown, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { API_BASE } from '../config';

export default function AlertsPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE}/api/alerts`)
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
                toast.error('Failed to load alerts');
                setLoading(false);
            });
    }, []);

    const dismissAlert = (idToRemove: number | string) => {
        setData(prevData => prevData.filter((alert, index) => {
            // Because the mock backend doesn't return IDs, we use index if ID is missing.
            // In a real app, you'd match by unique ID.
            const uniqueId = alert.id || index;
            return uniqueId !== idToRemove;
        }));
        toast.success('Alert dismissed', {
            style: {
                background: 'var(--color-bg-panel)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-subtle)'
            },
            iconTheme: {
                primary: 'var(--color-accent-green)',
                secondary: 'var(--color-bg-base)',
            },
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex-1 p-6 flex flex-col items-center animate-fade-in gap-6"
        >
            <div className="flex flex-col items-center text-center mb-4">
                <div className="w-16 h-16 rounded-full border-2 border-[var(--color-accent-red)] flex items-center justify-center mb-4">
                    <ShieldAlert className="w-8 h-8 text-[var(--color-accent-red)]" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Deception Alerts</h2>
                <p className="text-[var(--color-text-secondary)] max-w-md">
                    Review flagged products and detected hidden fees.
                </p>
            </div>

            {loading ? (
                <div className="animate-pulse flex flex-col gap-4 w-full max-w-3xl">
                    <div className="h-24 bg-[var(--color-bg-panel)] rounded-xl"></div>
                    <div className="h-24 bg-[var(--color-bg-panel)] rounded-xl"></div>
                </div>
            ) : (
                <div className="w-full max-w-3xl space-y-4">
                    {data.length === 0 && !loading ? (
                        <div className="text-center py-12 text-[var(--color-text-muted)]">
                            <p>No active alerts. Systems are clear.</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {data.map((alert, index) => {
                                const uniqueId = alert.id || index; // Fallback to index if no ID
                                return (
                                    <motion.div
                                        key={uniqueId}
                                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                        exit={{ opacity: 0, height: 0, scale: 0.95, margin: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={`p-4 rounded-xl border flex items-start gap-4 transition-colors relative group ${alert.severity === 'High' ? 'bg-red-500/5 border-red-500/30 hover:border-red-500/50' : 'bg-yellow-500/5 border-yellow-500/30 hover:border-yellow-500/50'}`}
                                    >
                                        <div className="mt-1">
                                            {alert.severity === 'High' ? <AlertTriangle className="w-5 h-5 text-red-400" /> : <Info className="w-5 h-5 text-yellow-400" />}
                                        </div>
                                        <div className="flex-1 pr-8">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className={`text-sm font-bold ${alert.severity === 'High' ? 'text-red-400' : 'text-yellow-400'}`}>{alert.type}</h3>
                                                <span className="text-xs text-[var(--color-text-muted)]">{alert.date}</span>
                                            </div>
                                            <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">{alert.message}</p>
                                        </div>
                                        <button
                                            onClick={() => dismissAlert(uniqueId)}
                                            className="absolute top-4 right-4 p-1 rounded-md text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--color-bg-panel-hover)] hover:text-[var(--color-text-primary)]"
                                            aria-label="Dismiss alert"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                </div>
            )}
        </motion.div>
    );
}
