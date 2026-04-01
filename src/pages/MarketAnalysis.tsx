import React from 'react';
import { Globe, ShieldAlert, CheckCircle2, Award, Zap, Cpu, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSearch } from '../context/SearchContext';

export default function MarketAnalysisPage() {
    const { productData: data } = useSearch();

    if (!data) {
        return (
            <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[500px]">
                <Globe className="w-16 h-16 text-[var(--color-border-strong)] mb-4 opacity-50" />
                <h2 className="text-2xl font-bold text-[var(--color-text-secondary)]">No Data Available</h2>
                <p className="text-[var(--color-text-muted)] mt-2">Please analyze a product on the Dashboard first.</p>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 p-6 max-w-5xl mx-auto w-full flex flex-col gap-8 pb-20">
            <h2 className="text-3xl font-extrabold text-[var(--color-text-primary)] flex items-center gap-3">
                <Globe className="w-8 h-8 text-[var(--color-accent-cyan)]" /> Market Analysis: {data.product_title}
            </h2>

            {/* HARDWARE RATING HUD */}
            <div className="bg-gradient-to-br from-[var(--color-bg-elevated)] to-[var(--color-bg-base)] rounded-2xl p-6 border border-[var(--color-border-subtle)] shadow-sm flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-2 flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-[var(--color-accent-purple)]" /> Hardware Spec Review
                    </h3>
                    <p className="text-lg font-medium text-[var(--color-text-primary)] leading-snug">
                        {data.spec_summary}
                    </p>
                </div>
                <div className="bg-[var(--color-bg-panel)] rounded-xl border border-[var(--color-border-strong)] flex items-center p-4 gap-4 px-8 min-w-[200px] justify-center shadow-inner">
                    <div className="text-center">
                        <span className="text-sm font-bold uppercase text-[var(--color-text-muted)] tracking-widest block mb-1">Spec Score</span>
                        <div className="flex items-baseline justify-center gap-1">
                            <span className="text-5xl font-black text-[var(--color-accent-purple)] tracking-tighter">{data.spec_rating}</span>
                            <span className="text-xl font-bold text-[var(--color-text-muted)]">/ 10</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* TRUST WARNINGS BLOCK */}
            {data.trust_warnings && data.trust_warnings.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 w-full flex flex-col gap-2 shadow-inner">
                    <h3 className="text-red-500 font-extrabold flex items-center gap-2 uppercase tracking-wider text-xs">
                        <ShieldAlert className="w-4 h-4" /> Official Ground Truth Discrepancies Detected
                    </h3>
                    <p className="text-red-400 text-xs font-bold mb-1">Our Agent scouted the official manufacturer's specs and caught the 3rd-party sellers lying:</p>
                    <ul className="list-disc pl-5 space-y-2 mt-1">
                        {data.trust_warnings.map((warning: string, i: number) => (
                            <li key={i} className="text-red-300 font-medium text-sm">{warning}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="space-y-6">
                <h3 className="text-xl font-extrabold text-[var(--color-text-primary)] border-b pb-2 border-[var(--color-border-subtle)]">Market Leaders</h3>
                {/* AMAZON */}
                <div className={`bg-[var(--color-bg-panel)] rounded-xl p-6 border transition-all border-[#FF9900]/30 hover:shadow-[#FF9900]/10 flex flex-col md:flex-row gap-6 items-start md:items-center ${data.winner === 'Amazon' ? 'ring-2 ring-[#FF9900]' : ''}`}>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                            Amazon Match {data.winner === 'Amazon' && <span className="bg-yellow-500/20 text-yellow-600 text-[10px] uppercase font-bold px-2 py-1 rounded border border-yellow-500/50">Deal Winner</span>}
                        </h3>
                        <div className="flex flex-col gap-1 text-sm mt-3">
                            {data.amazon_data.fine_print_warning ? (
                                <p className="text-red-400 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {data.amazon_data.fine_print_warning}</p>
                            ) : (
                                <p className="text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Clean Listing Verified</p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-start md:items-end w-full md:w-auto border-t md:border-t-0 border-[var(--color-border-subtle)] pt-4 md:pt-0">
                        <p className="text-xs text-[var(--color-text-muted)] font-bold text-right mb-1">{(data.amazon_data.discount_applied && data.amazon_data.discount_applied !== 'None Found') ? data.amazon_data.discount_applied : 'No Bank Discount Found'}</p>
                        <p className="text-3xl font-black text-[var(--color-text-primary)] mb-3">₹{data.amazon_data.landed_cost?.toLocaleString()}</p>
                    </div>
                </div>

                {/* FLIPKART */}
                <div className={`bg-[var(--color-bg-panel)] rounded-xl p-6 border transition-all border-[#2874F0]/30 hover:shadow-[#2874F0]/10 flex flex-col md:flex-row gap-6 items-start md:items-center ${data.winner === 'Flipkart' ? 'ring-2 ring-[#2874F0]' : ''}`}>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                            Flipkart Match {data.winner === 'Flipkart' && <span className="bg-blue-500/20 text-blue-600 text-[10px] uppercase font-bold px-2 py-1 rounded border border-blue-500/50">Deal Winner</span>}
                        </h3>
                        <div className="flex flex-col gap-1 text-sm mt-3">
                            {data.flipkart_data.fine_print_warning ? (
                                <p className="text-red-400 flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {data.flipkart_data.fine_print_warning}</p>
                            ) : (
                                <p className="text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Clean Listing Verified</p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-start md:items-end w-full md:w-auto border-t md:border-t-0 border-[var(--color-border-subtle)] pt-4 md:pt-0">
                        <p className="text-xs text-[var(--color-text-muted)] font-bold text-right mb-1">{(data.flipkart_data.discount_applied && data.flipkart_data.discount_applied !== 'None Found') ? data.flipkart_data.discount_applied : 'No Bank Discount Found'}</p>
                        <p className="text-3xl font-black text-[var(--color-text-primary)] mb-3">₹{data.flipkart_data.landed_cost?.toLocaleString()}</p>
                    </div>
                </div>

            </div>

            {/* COMPETITORS MATRIX */}
            {data.competitors && data.competitors.length > 0 && (
                <div className="mt-8 space-y-4">
                    <h3 className="text-xl font-extrabold text-[var(--color-text-primary)] border-b pb-2 border-[var(--color-border-subtle)] flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" /> Auto-Generated Competitors
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        {data.competitors.map((comp: any, idx: number) => (
                            <div key={idx} className="bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-xl p-5 hover:border-[var(--color-accent-blue)] transition-colors group relative overflow-hidden">
                                <span className="absolute top-0 right-0 bg-[var(--color-bg-elevated)] border-b border-l border-[var(--color-border-subtle)] px-3 py-1 rounded-bl-lg text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-widest">
                                    Alternative {idx + 1}
                                </span>
                                <h4 className="text-lg font-bold text-[var(--color-text-primary)] mb-1 pr-24">{comp.name}</h4>
                                <p className="text-2xl font-black text-[var(--color-accent-blue)] mb-4">₹{comp.estimated_price?.toLocaleString()}</p>
                                <div className="bg-[var(--color-bg-panel)] rounded-lg p-3 border border-[var(--color-border-subtle)]">
                                    <p className="text-sm font-medium text-[var(--color-text-secondary)]">"{comp.why_better}"</p>
                                </div>
                                <button className="mt-4 flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[var(--color-accent-blue)] group-hover:gap-2 transition-all">
                                    Analyze Phone Instead <ArrowRight className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
