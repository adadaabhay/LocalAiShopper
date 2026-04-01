import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Zap, ShoppingCart, ShieldAlert, TrendingDown, MessageSquare, Activity as ActivityIcon, User as UserIcon, Globe, BarChart3, Menu, X, Sun, Moon } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import NavButton from './NavButton';
import { useSearch } from '../context/SearchContext';
import { useTheme } from '../context/ThemeContext';

export default function Layout({ children }: { children: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { searchQuery, setSearchQuery } = useSearch();
    const { theme, toggleTheme } = useTheme();

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);
    return (
        <div className="flex h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)] font-sans overflow-hidden">
            {/* Global Toaster for notifications */}
            <Toaster
                position="bottom-right"
                toastOptions={{
                    style: {
                        background: 'var(--color-bg-panel)',
                        color: 'var(--color-text-primary)',
                        border: '1px solid var(--color-border-strong)',
                    },
                }}
            />

            {/* Desktop Sidebar (Fixed Left) */}
            <aside className="hidden lg:flex flex-col w-64 h-full bg-[var(--color-bg-panel)] border-r border-[var(--color-border-subtle)] flex-shrink-0 relative z-40 transition-colors duration-300">
                <div className="p-6 border-b border-[var(--color-border-subtle)]">
                    <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-cyan)]/10 text-[var(--color-accent-cyan)] flex items-center justify-center border border-[var(--color-accent-cyan)]/20 shadow-sm">
                            <Zap className="w-5 h-5" />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">ShopSense</h1>
                    </Link>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
                    <div className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-4 pb-2 pt-2">Overview</div>
                    <NavButton icon={ActivityIcon} label="Dashboard" to="/dashboard" />
                    <NavButton icon={Search} label="Explore" to="/dashboard/explore" />

                    <div className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-4 pb-2 pt-6">Intelligence</div>
                    <NavButton icon={Globe} label="Market Analysis" to="/dashboard/market-analysis" />
                    <NavButton icon={BarChart3} label="Price History" to="/dashboard/price-history" />
                    <NavButton icon={TrendingDown} label="Trends" to="/dashboard/trends" />

                    <div className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-4 pb-2 pt-6">System</div>
                    <NavButton icon={ShieldAlert} label="Alerts" to="/dashboard/alerts" />
                    <NavButton icon={MessageSquare} label="Messages" to="/dashboard/messages" />
                </div>
                <div className="p-4 border-t border-[var(--color-border-subtle)]">
                    <NavButton icon={UserIcon} label="Settings" to="/dashboard/profile" />
                </div>
            </aside>

            {/* Mobile Sidebar Navigation (Slide-out Overlay) */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                            className="fixed inset-y-0 left-0 w-72 bg-[var(--color-bg-panel)] border-r border-[var(--color-border-subtle)] z-50 flex flex-col shadow-2xl lg:hidden"
                        >
                            <div className="p-6 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
                                <Link to="/dashboard" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
                                    <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-cyan)]/10 text-[var(--color-accent-cyan)] flex items-center justify-center border border-[var(--color-accent-cyan)]/20">
                                        <Zap className="w-4 h-4" />
                                    </div>
                                    <h1 className="text-lg font-bold tracking-tight text-[var(--color-text-primary)]">ShopSense</h1>
                                </Link>
                                <button className="p-2 -mr-2 text-[var(--color-text-secondary)]" onClick={() => setIsMobileMenuOpen(false)}>
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                                <div className="text-xs font-mono text-[var(--color-text-muted)] tracking-widest px-4 pb-2 pt-2 uppercase">Main Setup</div>
                                <NavButton icon={ActivityIcon} label="Terminal" to="/dashboard" />
                                <NavButton icon={Search} label="Explore" to="/dashboard/explore" />

                                <div className="text-xs font-mono text-[var(--color-text-muted)] tracking-widest px-4 pb-2 pt-6 uppercase">Intelligence</div>
                                <NavButton icon={Globe} label="Market Analysis" to="/dashboard/market-analysis" />
                                <NavButton icon={BarChart3} label="Price History" to="/dashboard/price-history" />
                                <NavButton icon={TrendingDown} label="Trends" to="/dashboard/trends" />

                                <div className="text-xs font-mono text-[var(--color-text-muted)] tracking-widest px-4 pb-2 pt-6 uppercase">System Logs</div>
                                <NavButton icon={ShieldAlert} label="Alerts" to="/dashboard/alerts" />
                                <NavButton icon={MessageSquare} label="Messages" to="/dashboard/messages" />
                            </div>
                            <div className="p-4 border-t border-[var(--color-border-strong)]">
                                <NavButton icon={UserIcon} label="Profile Settings" to="/dashboard/profile" />
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Right Side: Main Content Area (Header + Routes) */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden shrink relative z-10">

                {/* Top Header (Search & Actions) */}
                <header className="sticky top-0 z-30 px-4 sm:px-8 py-4 flex items-center justify-between border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-base)]/80 backdrop-blur-md transition-colors duration-300">

                    {/* Mobile Hamburger Toggle */}
                    <button
                        className="p-2 -ml-2 mr-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors lg:hidden rounded-lg hover:bg-[var(--color-bg-panel-hover)]"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="flex-1 max-w-2xl relative w-full">
                        <div className="relative flex items-center w-full group">
                            <Search className="absolute left-4 w-4 h-4 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-accent-cyan)] transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search products, orders, or paste an Amazon URL..."
                                className="w-full bg-[var(--color-bg-panel)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] rounded-lg py-2 pl-11 pr-4 text-sm focus:outline-none focus:border-[var(--color-accent-cyan)] focus:ring-1 focus:ring-[var(--color-accent-cyan)] transition-shadow placeholder-[var(--color-text-muted)] shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 ml-6 pl-6 border-l border-[var(--color-border-subtle)]">
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-cyan)] hover:bg-[var(--color-bg-panel)] rounded-full transition-all border border-transparent hover:border-[var(--color-border-subtle)] shadow-sm"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        <div className="hidden md:flex items-center gap-2 bg-[var(--color-bg-panel)] border border-[var(--color-border-subtle)] px-3 py-1.5 rounded-full shadow-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-green)]"></div>
                            <span className="text-xs font-medium text-[var(--color-text-secondary)]">System Online</span>
                        </div>

                        {/* Profile Avatar Mock */}
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--color-accent-cyan)] to-[var(--color-accent-purple)] flex items-center justify-center text-white font-bold text-xs shadow-md border border-white/20">
                            JD
                        </div>
                    </div>
                </header>

                {/* Scalable Dashboard Content Outlet */}
                <main className="flex-1 overflow-y-auto custom-scrollbar relative">
                    {children}
                </main>
            </div>
        </div>
    );
}
