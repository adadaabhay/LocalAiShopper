import React, { useState } from 'react';
import { Search, Loader2, ShieldAlert, Zap, Target, Award, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useSearch } from '../context/SearchContext';

export default function Home() {
    // 1. COMMAND BAR STATE
    const [persona, setPersona] = useState('General Shopper');

    // Core Engine State mapped to global Context
    const { searchQuery, setSearchQuery, productData: data, setProductData: setData, isLoading: loading, setIsLoading: setLoading } = useSearch();

    const API_URL = "http://localhost:8000/api/v1/compare-product";

    const handleAnalyze = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!searchQuery) {
            toast.error('Please enter a product URL or name.');
            return;
        }
        setLoading(true);
        setData(null);

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    product_name: searchQuery,
                    user_persona: persona
                })
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.detail || "API Error");
            setData(result);
            toast.success("Agentic Piggyback Analysis Complete!", { icon: '🤖' });
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to analyze product. Ensure backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col p-6 max-w-[1600px] mx-auto w-full gap-6 text-[var(--color-text-primary)]">
            {/* COMMAND BAR */}
            <section className="bg-[var(--color-bg-panel)] rounded-2xl p-4 border border-[var(--color-border-subtle)] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between z-20">
                <form onSubmit={handleAnalyze} className="relative w-full xl:w-1/2">
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Type a product name to search the web (e.g. iPhone 15 128GB)..." className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-strong)] rounded-xl py-3 pl-12 pr-32 focus:outline-none focus:border-[var(--color-accent-cyan)] transition-colors h-[52px]" />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] w-5 h-5" />
                    <button type="submit" disabled={loading} className="absolute right-2 top-[6px] bottom-[6px] bg-[var(--color-accent-blue)] text-white px-6 rounded-lg font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Analyze"}
                    </button>
                </form>
                <div className="flex items-center gap-4 w-full xl:w-auto pb-2 md:pb-0 hide-scrollbar overflow-x-auto">
                    <div className="flex items-center gap-3 bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] px-4 py-3 rounded-xl min-w-max h-[52px]">
                        <Target className="w-5 h-5 text-[var(--color-accent-purple)]" />
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider leading-none mb-1">Persona View</span>
                            <select value={persona} onChange={(e) => setPersona(e.target.value)} className="bg-transparent border-none outline-none text-sm font-bold text-[var(--color-text-primary)] cursor-pointer p-0 leading-none">
                                <option value="General Shopper">General Shopper</option>
                                <option value="Student">Student</option>
                                <option value="Gamer">Gamer</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {!data && !loading && (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] border-2 border-[var(--color-border-subtle)] border-dashed rounded-3xl bg-[var(--color-bg-panel)]/50 mt-4">
                    <ShieldAlert className="w-16 h-16 text-[var(--color-border-strong)] mb-6 opacity-50" />
                    <h2 className="text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">Agentic Pipeline Ready</h2>
                    <p className="text-[var(--color-text-muted)] mt-3 max-w-md text-center">Analyze a product to trigger the DuckDuckGo Search + Gemini True Cost calculator natively mapping the new Pydantic models.</p>
                </div>
            )}

            {loading && !data && (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] gap-4">
                    <Loader2 className="w-12 h-12 text-[var(--color-accent-blue)] animate-spin" />
                    <p className="text-[var(--color-text-secondary)] font-medium animate-pulse">Piggyback Search on Amazon & Flipkart...</p>
                </div>
            )}

            {data && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 xl:grid-cols-12 gap-8 w-full">
                    {/* CORE COMPARISON */}
                    <div className="xl:col-span-8 flex flex-col gap-8">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <h2 className="text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
                                    {data.product_title}
                                </h2>
                                <span className="bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] border border-[var(--color-accent-blue)]/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                                    Live Piggyback Match
                                </span>
                            </div>
                            <p className="text-[var(--color-text-muted)] font-medium text-sm flex items-center gap-2 mb-2">
                                <Search className="w-4 h-4" /> Auto-Inferred: {data.inferred_variant}
                            </p>
                            {data.trust_warnings && data.trust_warnings.length > 0 ? (
                                <span className="bg-red-500/10 text-red-500 border border-red-500/30 px-3 py-1 rounded-md text-xs font-bold inline-flex items-center w-max gap-1">
                                    <ShieldAlert className="w-3 h-3" /> Seller Discrepancies Detected
                                </span>
                            ) : (
                                <span className="bg-green-500/10 text-green-500 border border-green-500/30 px-3 py-1 rounded-md text-xs font-bold inline-flex items-center w-max gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> 100% Officially Verified Specs
                                </span>
                            )}
                        </div>

                        {/* Split Screen Horizon Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Amazon Card */}
                            <div className={`rounded-2xl border-2 flex flex-col relative overflow-hidden transition-all hover:shadow-lg bg-[#FF9900]/5 border-[#FF9900]/40 ${data.winner === 'Amazon' ? 'ring-4 ring-[#FF9900]' : ''}`}>
                                <div className="p-4 border-b-2 border-[#FF9900]/20 flex justify-between items-center">
                                    <span className="font-extrabold text-xl tracking-tight">Amazon</span>
                                    {data.winner === 'Amazon' && <span className="bg-yellow-500/20 text-yellow-600 text-[10px] uppercase font-bold px-2 py-1 rounded flex items-center gap-1"><Award className="w-3 h-3" /> Winner</span>}
                                </div>
                                <div className="p-6 flex-1 flex flex-col justify-center">
                                    <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-1 flex items-center gap-2">
                                        Sticker Price: <span className="line-through decoration-red-500/50 decoration-2">₹{data.amazon_data.sticker_price?.toLocaleString()}</span>
                                    </p>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-5xl font-black text-[var(--color-text-primary)] tracking-tighter">₹{data.amazon_data.landed_cost?.toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm font-bold text-[var(--color-accent-blue)]">Final Landed Cost</p>
                                </div>
                            </div>

                            {/* Flipkart Card */}
                            <div className={`rounded-2xl border-2 flex flex-col relative overflow-hidden transition-all hover:shadow-lg bg-[#2874F0]/5 border-[#2874F0]/40 ${data.winner === 'Flipkart' ? 'ring-4 ring-[#2874F0]' : ''}`}>
                                <div className="p-4 border-b-2 border-[#2874F0]/20 flex justify-between items-center">
                                    <span className="font-extrabold text-xl tracking-tight">Flipkart</span>
                                    {data.winner === 'Flipkart' && <span className="bg-blue-500/20 text-blue-600 text-[10px] uppercase font-bold px-2 py-1 rounded flex items-center gap-1"><Award className="w-3 h-3" /> Winner</span>}
                                </div>
                                <div className="p-6 flex-1 flex flex-col justify-center">
                                    <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-1 flex items-center gap-2">
                                        Sticker Price: <span className="line-through decoration-red-500/50 decoration-2">₹{data.flipkart_data.sticker_price?.toLocaleString()}</span>
                                    </p>
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-5xl font-black text-[var(--color-text-primary)] tracking-tighter">₹{data.flipkart_data.landed_cost?.toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm font-bold text-[var(--color-accent-blue)]">Final Landed Cost</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* 3. AGENTIC SIDEBAR */}
                    <div className="xl:col-span-4 flex flex-col gap-6">
                        {/* Winner/Verdict Badge */}
                        <div className="bg-gradient-to-br from-[var(--color-accent-blue)] to-[var(--color-accent-purple)] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 mb-2">Agent Verdict - {data.winner} Wins</h3>
                            <p className="text-lg font-bold leading-tight relative z-10">{data.persona_verdict}</p>
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        </div>

                        {/* Persona Score */}
                        <div className="bg-[var(--color-bg-panel)] rounded-2xl p-6 border-2 border-[var(--color-accent-purple)] shadow-[0_0_30px_rgba(168,85,247,0.1)] text-center relative overflow-hidden">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-accent-purple)] mb-6">Persona Match Score</h3>
                            <div className="relative inline-flex items-center justify-center mb-2">
                                <svg className="w-36 h-36 transform -rotate-90">
                                    <circle cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-[var(--color-border-subtle)]" />
                                    <circle cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-[var(--color-accent-purple)] transition-all" strokeDasharray="402" strokeDashoffset={402 - (402 * ((data.persona_score || 0) / 10))} strokeLinecap="round" />
                                </svg>
                                <span className="absolute text-5xl font-black text-[var(--color-text-primary)]">{data.persona_score}</span>
                            </div>
                        </div>

                        {/* Smart Deal Stacker Container */}
                        <div className="bg-[var(--color-bg-panel)] rounded-2xl p-6 border border-[var(--color-border-subtle)] shadow-sm">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-4 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-[var(--color-accent-cyan)]" /> Applied Discounts ({data.winner})
                            </h3>
                            <div className="space-y-3 font-mono text-sm font-medium">
                                <div className="flex justify-between items-center text-[var(--color-text-secondary)]">
                                    <span>Sticker Price</span>
                                    <span>₹{(data.winner === 'Flipkart' ? data.flipkart_data.sticker_price : data.amazon_data.sticker_price)?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-green-400 border-b border-[var(--color-border-subtle)] pb-4">
                                    <span>Discount Config</span>
                                    <span className="text-right text-xs max-w-[150px] leading-tight">{(data.winner === 'Flipkart' ? data.flipkart_data.discount_applied : data.amazon_data.discount_applied) || 'None'}</span>
                                </div>
                                <div className="flex justify-between items-center text-xl font-black text-[var(--color-text-primary)] pt-1">
                                    <span>Landed Cost</span>
                                    <span>₹{(data.winner === 'Flipkart' ? data.flipkart_data.landed_cost : data.amazon_data.landed_cost)?.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Fine Print Warnings */}
                        <div className="flex flex-col gap-4">
                            {data.amazon_data.fine_print_warning && (
                                <div className="bg-red-500/10 border-l-4 border-red-500 rounded-r-xl p-4 flex gap-3 text-red-400 shadow-sm">
                                    <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1">Fine Print (Amazon)</h4>
                                        <p className="text-sm font-semibold">{data.amazon_data.fine_print_warning}</p>
                                    </div>
                                </div>
                            )}
                            {data.flipkart_data.fine_print_warning && (
                                <div className="bg-red-500/10 border-l-4 border-red-500 rounded-r-xl p-4 flex gap-3 text-red-400 shadow-sm">
                                    <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1">Fine Print (Flipkart)</h4>
                                        <p className="text-sm font-semibold">{data.flipkart_data.fine_print_warning}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </motion.div>
            )}
        </div>
    );
}
