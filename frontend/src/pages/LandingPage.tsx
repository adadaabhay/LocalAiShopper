import React, { useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Zap, Activity, BarChart3, ChevronRight, Globe, Lock, Cpu, Database, Network, EyeOff, ShieldAlert, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();
    const { scrollY } = useScroll();

    // Parallax effects for the background grid and glow
    const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
    const y2 = useTransform(scrollY, [0, 1000], [0, -100]);
    const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

    const [isCleaned, setIsCleaned] = useState(false);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.4 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const floatingVariants = {
        animate: {
            y: [0, -15, 0],
            transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
            className="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)] font-sans scanline overflow-x-hidden relative flex flex-col items-center selection:bg-[var(--color-accent-cyan)] selection:text-black"
        >
            {/* Background Effects */}
            <motion.div style={{ y: y1 }} className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[var(--color-accent-cyan)]/10 blur-[120px] pointer-events-none z-0"></motion.div>
            <motion.div style={{ y: y2 }} className="fixed top-[40%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[var(--color-accent-purple)]/10 blur-[120px] pointer-events-none z-0"></motion.div>

            {/* Top Minimal Nav */}
            <motion.nav variants={itemVariants} className="w-full max-w-7xl px-8 py-6 flex items-center justify-between relative z-50">
                <div className="flex items-center gap-3">
                    <Zap className="w-8 h-8 text-[var(--color-accent-cyan)]" />
                    <h1 className="text-2xl font-bold tracking-wider neon-text-cyan uppercase">ShopSense AI</h1>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-mono tracking-widest text-[var(--color-text-secondary)]">
                    <span onClick={() => scrollToSection('intelligence')} className="hover:text-[var(--color-accent-cyan)] cursor-pointer transition-colors">INTELLIGENCE</span>
                    <span onClick={() => scrollToSection('defense')} className="hover:text-[var(--color-accent-purple)] cursor-pointer transition-colors">DEFENSE</span>
                    <span onClick={() => scrollToSection('analytics')} className="hover:text-[var(--color-accent-green)] cursor-pointer transition-colors">ANALYTICS</span>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <motion.main style={{ opacity: heroOpacity }} className="min-h-[90vh] w-full max-w-7xl px-8 flex flex-col lg:flex-row items-center justify-center gap-16 relative z-10">

                {/* Left Text Content */}
                <div className="flex-1 flex flex-col items-start text-left">
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent-cyan)]/10 border border-[var(--color-accent-cyan)]/30 text-[var(--color-accent-cyan)] text-xs font-mono tracking-widest uppercase mb-6">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-accent-cyan)] animate-pulse"></span>
                        System Online v2.4
                    </motion.div>

                    <motion.h2 variants={itemVariants} className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
                        See Through <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-red)] to-[var(--color-accent-purple)]">
                            The Deception.
                        </span>
                    </motion.h2>

                    <motion.p variants={itemVariants} className="text-lg lg:text-xl text-[var(--color-text-secondary)] max-w-xl mb-10 leading-relaxed">
                        Deploy our autonomous agentic architecture to instantly analyze product listings, detect fake urgency tactics, and uncover the true market value of any item before you buy.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[var(--color-accent-cyan)] to-[var(--color-accent-blue)] text-black font-bold tracking-wider uppercase rounded-xl hover:shadow-[0_0_30px_rgba(0,255,255,0.3)] transition-all flex items-center justify-center gap-3 group"
                        >
                            <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Initialize Dashboard
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button onClick={() => scrollToSection('intelligence')} className="w-full sm:w-auto px-8 py-4 glass-panel border border-[var(--color-border-strong)] text-[var(--color-text-primary)] font-medium tracking-wider uppercase rounded-xl hover:border-[var(--color-accent-cyan)] transition-colors flex items-center justify-center gap-3">
                            <Lock className="w-5 h-5 text-[var(--color-text-secondary)]" />
                            View Capability
                        </button>
                    </motion.div>
                </div>

                {/* Right Visual Element */}
                <motion.div variants={itemVariants} className="flex-1 w-full max-w-lg relative isolate">
                    <motion.div variants={floatingVariants} animate="animate" className="relative z-10 w-full aspect-square rounded-3xl glass-panel border border-[var(--color-border-strong)] p-8 flex flex-col overflow-hidden shadow-2xl">

                        {/* Fake UI inside the glass panel */}
                        <div className="flex items-center gap-2 mb-6 border-b border-[var(--color-border-subtle)] pb-4">
                            <div className="w-3 h-3 rounded-full bg-[var(--color-accent-red)]"></div>
                            <div className="w-3 h-3 rounded-full bg-[var(--color-accent-green)]"></div>
                            <div className="w-3 h-3 rounded-full bg-[var(--color-accent-cyan)]"></div>
                            <span className="ml-2 text-xs font-mono text-[var(--color-text-muted)] tracking-widest">ANALYSIS.EXE</span>
                        </div>

                        <div className="space-y-4 flex-1 flex flex-col justify-center">
                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2, delay: 1, ease: "circOut" }}
                                className="h-12 glass-panel border border-[var(--color-border-subtle)] rounded-lg flex items-center px-4 gap-3 relative overflow-hidden"
                            >
                                <Globe className="w-5 h-5 text-[var(--color-accent-cyan)] z-10" />
                                <div className="h-2 w-32 bg-[var(--color-bg-panel-hover)] rounded-full z-10 overflow-hidden">
                                    <motion.div
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 1.5, delay: 1.5, ease: "linear", repeat: Infinity, repeatType: 'reverse' }}
                                        className="h-full bg-[var(--color-accent-cyan)]"
                                    ></motion.div>
                                </div>
                                <span className="absolute right-4 text-xs font-mono text-[var(--color-accent-cyan)] z-10">SCANNING...</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent-cyan)]/10 to-transparent"></div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 3 }}
                                className="h-16 glass-panel border border-[var(--color-accent-red)]/50 rounded-lg flex items-center px-4 gap-4"
                            >
                                <div className="p-2 rounded-full bg-[var(--color-accent-red)]/10">
                                    <ShieldCheck className="w-5 h-5 text-[var(--color-accent-red)]" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[var(--color-text-primary)]">Threat Detected</p>
                                    <p className="text-xs text-[var(--color-text-muted)] font-mono">Fake urgency timer active.</p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 3.5 }}
                                className="h-16 glass-panel border border-[var(--color-accent-green)]/50 rounded-lg flex items-center px-4 gap-4"
                            >
                                <div className="p-2 rounded-full bg-[var(--color-accent-green)]/10">
                                    <BarChart3 className="w-5 h-5 text-[var(--color-accent-green)]" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[var(--color-text-primary)]">True Value Mapped</p>
                                    <p className="text-xs text-[var(--color-text-muted)] font-mono">Found 14% cheaper alternatives.</p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Decorative floating elements behind the main panel */}
                    <motion.div
                        animate={{ y: [0, 20, 0], rotate: [0, 5, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-accent-cyan)]/20 to-transparent blur-xl -z-10"
                    ></motion.div>
                    <motion.div
                        animate={{ y: [0, -30, 0], rotate: [0, -10, 0] }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-gradient-to-tl from-[var(--color-accent-purple)]/20 to-transparent blur-xl -z-10"
                    ></motion.div>

                </motion.div>
            </motion.main>

            {/* Scroll Indicator */}
            <motion.div
                style={{ opacity: heroOpacity }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
            >
                <span className="text-[10px] font-mono tracking-widest text-[var(--color-text-muted)] uppercase">Scroll / Discover</span>
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-px h-8 bg-gradient-to-b from-[var(--color-text-muted)] to-transparent"
                ></motion.div>
            </motion.div>

            {/* Content Section: INTELLIGENCE */}
            <section id="intelligence" className="w-full max-w-7xl mx-auto px-8 py-32 relative z-20 flex flex-col md:flex-row items-center gap-16 border-t border-[var(--color-border-subtle)]">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="flex-1 space-y-6"
                >
                    <div className="flex items-center gap-4 text-[var(--color-accent-cyan)] mb-4">
                        <Cpu className="w-8 h-8" />
                        <h3 className="text-xl font-mono tracking-widest uppercase">Intelligence Layer</h3>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-bold leading-tight">Parses beyond the pixels.</h2>
                    <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
                        Our AI doesn't just look at the price tag. It scans the entire DOM structure, cross-references with massive datasets, and evaluates product specifications, materials, and historical lifecycles.
                    </p>
                    <ul className="space-y-4 pt-4">
                        <li className="flex items-center gap-3">
                            <CheckCircle2 className="text-[var(--color-accent-cyan)] w-5 h-5" />
                            <span className="text-[var(--color-text-primary)]">Automated Spec Sheet Extraction</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <CheckCircle2 className="text-[var(--color-accent-cyan)] w-5 h-5" />
                            <span className="text-[var(--color-text-primary)]">Global Competitor Matching</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <CheckCircle2 className="text-[var(--color-accent-cyan)] w-5 h-5" />
                            <span className="text-[var(--color-text-primary)]">Sentiment Analysis on Reviews</span>
                        </li>
                    </ul>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 50, rotateY: 20 }}
                    whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="flex-1 w-full glass-panel rounded-2xl p-6 border border-[var(--color-accent-cyan)]/30 shadow-[0_0_50px_rgba(0,255,255,0.1)] relative"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-accent-cyan)] to-transparent opacity-50"></div>
                    <div className="flex items-center gap-2 mb-4">
                        <Database className="w-4 h-4 text-[var(--color-text-secondary)]" />
                        <span className="text-xs font-mono text-[var(--color-text-secondary)]">AI_LOG_STREAM</span>
                    </div>
                    <div className="space-y-2 font-mono text-sm text-[var(--color-text-secondary)] overflow-hidden h-48 relative">
                        <motion.div
                            animate={{ y: [0, -100] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="space-y-2"
                        >
                            <p><span className="text-[var(--color-accent-green)]">[+]</span> Connected into data-stream...</p>
                            <p><span className="text-[var(--color-accent-cyan)]">[*]</span> Analyzing payload string: "Sony WH-1000XM4"</p>
                            <p><span className="text-[var(--color-accent-cyan)]">[*]</span> Cross-referencing 400+ vendor catalogs...</p>
                            <p><span className="text-[var(--color-accent-green)]">[+]</span> Match found at Vendor B: -12% price diff</p>
                            <p><span className="text-[var(--color-accent-purple)]">[*]</span> Evaluating review sentiment: 84% Positive</p>
                            <p><span className="text-[var(--color-accent-purple)]">[*]</span> Checking stock flags: True</p>
                            <p><span className="text-[var(--color-accent-cyan)]">[*]</span> Generating confidence score...</p>
                            <p><span className="text-[var(--color-accent-green)]">[+]</span> Validated. True Value computed.</p>
                            {/* Duplicate for infinite scroll effect */}
                            <p className="mt-8"><span className="text-[var(--color-accent-green)]">[+]</span> Connected into data-stream...</p>
                            <p><span className="text-[var(--color-accent-cyan)]">[*]</span> Analyzing payload string: "Sony WH-1000XM4"</p>
                            <p><span className="text-[var(--color-accent-cyan)]">[*]</span> Cross-referencing 400+ vendor catalogs...</p>
                        </motion.div>
                        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[var(--color-bg-panel)] to-transparent"></div>
                    </div>
                </motion.div>
            </section>

            {/* Content Section: DEFENSE */}
            <section id="defense" className="w-full max-w-7xl mx-auto px-8 py-32 relative z-20 flex flex-col md:flex-row-reverse items-center gap-16 border-t border-[var(--color-border-subtle)]">
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="flex-1 space-y-6"
                >
                    <div className="flex items-center gap-4 text-[var(--color-accent-purple)] mb-4">
                        <ShieldCheck className="w-8 h-8" />
                        <h3 className="text-xl font-mono tracking-widest uppercase">Active Defense</h3>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-bold leading-tight">Neutralize psychological manipulation.</h2>
                    <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
                        Retailers use fake countdown timers, artificial low-stock warnings, and deceptive "slashes" on prices to rush your decisions. We rip those elements out of the DOM, providing you with a clean, stress-free view.
                    </p>

                    <button
                        onClick={() => setIsCleaned(!isCleaned)}
                        className={`mt-4 px-6 py-3 rounded-xl font-bold tracking-wider flex items-center gap-3 transition-all ${isCleaned
                                ? 'bg-[var(--color-accent-green)]/20 text-[var(--color-accent-green)] border border-[var(--color-accent-green)]'
                                : 'bg-[var(--color-accent-purple)] text-white hover:brightness-110'
                            }`}
                    >
                        {isCleaned ? <ShieldCheck className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                        {isCleaned ? 'THREATS NEUTRALIZED' : 'CLEANSE LISTING'}
                    </button>

                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="flex-1 w-full"
                >
                    <AnimatePresence mode="wait">
                        {!isCleaned ? (
                            <motion.div
                                key="scam"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="glass-panel p-6 rounded-2xl border-2 border-[var(--color-accent-red)] shadow-[0_0_30px_rgba(255,0,0,0.15)] relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 bg-[var(--color-accent-red)] text-white text-xs font-bold px-3 py-1 font-mono animate-pulse">
                                    ONLY 2 LEFT IN STOCK!
                                </div>
                                <h4 className="text-xl font-bold text-[var(--color-text-primary)] mt-4">Premium Noise Cancelling Headphones</h4>
                                <div className="mt-4 flex items-end gap-3 rounded bg-[var(--color-accent-red)]/10 p-3 border border-[var(--color-accent-red)]/30">
                                    <ShieldAlert className="w-5 h-5 text-[var(--color-accent-red)] animate-bounce" />
                                    <div>
                                        <p className="text-xs text-[var(--color-accent-red)] font-bold">FLASH SALE ENDS IN:</p>
                                        <p className="text-xl font-mono text-[var(--color-accent-red)] font-bold">00:04:12</p>
                                    </div>
                                </div>
                                <div className="mt-6 flex items-end gap-2">
                                    <span className="text-3xl font-bold text-[var(--color-text-primary)]">$299.99</span>
                                    <span className="text-lg text-[var(--color-text-muted)] line-through decoration-[var(--color-accent-red)] decoration-2">$599.99</span>
                                </div>
                                <button className="w-full mt-6 py-3 bg-[var(--color-accent-red)] text-white font-bold rounded-lg uppercase tracking-wider">
                                    Buy Now Before It's Gone!
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="clean"
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="glass-panel p-6 rounded-2xl border-2 border-[var(--color-accent-green)] shadow-[0_0_30px_rgba(0,255,0,0.15)] relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 bg-[var(--color-accent-green)] text-black text-xs font-bold px-3 py-1 font-mono">
                                    CLEANSED VIEW
                                </div>
                                <h4 className="text-xl font-bold text-[var(--color-text-primary)] mt-4">Premium Noise Cancelling Headphones</h4>
                                <div className="mt-4 flex items-center justify-between p-3 bg-[var(--color-bg-panel-hover)] rounded border border-[var(--color-border-subtle)]">
                                    <p className="text-sm text-[var(--color-text-secondary)]">Historical avg price: <span className="text-[var(--color-text-primary)] font-mono">$285.00</span></p>
                                    <CheckCircle2 className="w-5 h-5 text-[var(--color-accent-green)]" />
                                </div>
                                <div className="mt-6 flex items-end gap-2">
                                    <span className="text-3xl font-bold text-[var(--color-text-primary)]">$299.99</span>
                                    {/* Removed the fake original price */}
                                </div>
                                <button className="w-full mt-6 py-3 border border-[var(--color-border-strong)] hover:border-[var(--color-accent-cyan)] text-[var(--color-text-primary)] font-bold rounded-lg uppercase tracking-wider transition-colors">
                                    Proceed to Market Analysis
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </section>

            {/* Content Section: ANALYTICS */}
            <section id="analytics" className="w-full max-w-7xl mx-auto px-8 py-32 relative z-20 flex flex-col items-center gap-16 border-t border-[var(--color-border-subtle)]">

                <div className="text-center max-w-3xl mb-8">
                    <div className="flex items-center justify-center gap-4 text-[var(--color-accent-green)] mb-4">
                        <TrendingUp className="w-8 h-8" />
                        <h3 className="text-xl font-mono tracking-widest uppercase">Macro Analytics</h3>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">Graphs that make sense.</h2>
                    <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
                        Access beautiful, interactive dashboards tracking historical price trends and market fluctuations. Never fall for a "fake sale" again. If a product usually costs $100 and is marked up to $200 before being "discounted" to $150, our graphs will show the truth instantly.
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="w-full max-w-4xl glass-panel p-8 rounded-2xl border border-[var(--color-border-strong)] relative"
                >
                    <div className="flex justify-between items-center border-b border-[var(--color-border-subtle)] pb-4 mb-8">
                        <div>
                            <h4 className="font-bold text-[var(--color-text-primary)] text-xl">Price History Simulator</h4>
                            <p className="text-xs text-[var(--color-text-muted)] font-mono">Last 6 Months</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="w-3 h-3 rounded-full bg-[var(--color-accent-green)]"></span>
                            <span className="w-3 h-3 rounded-full bg-[var(--color-accent-red)]"></span>
                        </div>
                    </div>

                    <div className="flex items-end h-64 gap-2 w-full">
                        {/* Animated Mock Graph Bars */}
                        {[30, 45, 35, 60, 40, 80, 50, 45, 30, 20, 40, 60].map((height, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                whileInView={{ height: `${height}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: i * 0.1, type: "spring" }}
                                className={`flex-1 rounded-t-sm relative group ${height > 50 ? 'bg-[var(--color-accent-red)]/50' : 'bg-[var(--color-accent-green)]/50'} hover:brightness-125 transition-all`}
                            >
                                {/* Tooltip */}
                                <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] px-2 py-1 rounded text-xs font-mono z-10 transition-opacity">
                                    ${height * 2}.00
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-xs font-mono text-[var(--color-text-muted)] border-t border-[var(--color-border-subtle)] pt-4">
                        <span>JAN</span>
                        <span>FEB</span>
                        <span>MAR</span>
                        <span>APR</span>
                        <span>MAY</span>
                        <span>JUN</span>
                    </div>
                </motion.div>

            </section>

            {/* Final CTA */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="w-full border-t border-[var(--color-border-strong)] relative z-20 py-32 bg-[var(--color-bg-elevated)]/30 overflow-hidden flex flex-col items-center text-center px-8"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--color-bg-base)]"></div>

                <h2 className="text-4xl lg:text-6xl font-bold tracking-tight mb-8 relative z-10">
                    Ready to take control?
                </h2>
                <p className="text-lg text-[var(--color-text-secondary)] max-w-xl mb-12 relative z-10">
                    Step into the dashboard and let the AI agent do the heavy lifting for your next purchase.
                </p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="relative z-10 px-12 py-6 bg-gradient-to-r from-[var(--color-accent-cyan)] to-[var(--color-accent-purple)] text-white font-bold text-xl tracking-wider uppercase rounded-2xl shadow-[0_0_50px_rgba(0,255,255,0.4)] hover:shadow-[0_0_80px_rgba(0,255,255,0.6)] hover:scale-105 transition-all flex items-center gap-4 group"
                >
                    <Network className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    Enter the System
                </button>
            </motion.section>

        </motion.div>
    );
}
