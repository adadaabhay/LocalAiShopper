import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, Star, MapPin, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSearch } from '../context/SearchContext';
import toast from 'react-hot-toast';
import { API_BASE } from '../config';

interface ExploreItem {
    id: string;
    name: string;
    category: string;
    trend_score: number;
    rating: number;
    location: string;
    image: string; // Assuming an image property for the new card layout
}

export default function ExplorePage() {
    const [items, setItems] = useState<ExploreItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { searchQuery } = useSearch();

    useEffect(() => {
        fetch(`${API_BASE}/api/explore`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch data');
                return res.json();
            })
            .then(data => {
                setItems(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                toast.error('Failed to load explore data');
                setLoading(false);
            });
    }, []);

    const filteredItems = items.filter(item => {
        const query = searchQuery.toLowerCase();
        const matchName = item.name?.toLowerCase().includes(query) || false;
        const matchCat = item.category?.toLowerCase().includes(query) || false;
        const matchLoc = item.location?.toLowerCase().includes(query) || false;
        return matchName || matchCat || matchLoc;
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex-1 p-6 flex flex-col items-center animate-fade-in gap-6"
        >
            <div className="flex flex-col items-center text-center mb-4">
                <div className="w-16 h-16 rounded-full border-2 border-[var(--color-accent-blue)] flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-[var(--color-accent-blue)]" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Explore Products</h2>
                <p className="text-[var(--color-text-secondary)] max-w-md">
                    Trending categories and highly-rated accessories.
                </p>
            </div>

            <div className="w-full max-w-2xl flex justify-between items-center mb-4">
                <div className="relative flex-1 mr-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                    <input
                        type="text"
                        placeholder="Search products, categories, locations..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--color-bg-panel)] border border-[var(--color-border-subtle)] focus:border-[var(--color-accent-blue)] outline-none transition-colors text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
                        value={searchQuery}
                        readOnly // Search input is controlled by global context, not directly editable here
                    />
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-bg-panel)] border border-[var(--color-border-subtle)] hover:border-[var(--color-accent-cyan)] transition-colors text-sm font-medium"
                >
                    <Filter className="w-4 h-4 text-[var(--color-text-secondary)]" />
                    <span>Filters</span>
                </motion.button>
            </div>

            {loading ? (
                <div className="animate-pulse flex flex-col gap-4 w-full max-w-2xl">
                    <div className="h-24 bg-[var(--color-bg-panel)] rounded-xl"></div>
                    <div className="h-24 bg-[var(--color-bg-panel)] rounded-xl"></div>
                    <div className="h-24 bg-[var(--color-bg-panel)] rounded-xl"></div>
                </div>
            ) : (
                <div className="w-full max-w-2xl space-y-4">
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-[var(--color-text-muted)] text-lg">No products found matching "{searchQuery}"</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredItems.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="glass-panel p-4 rounded-xl border border-[var(--color-border-subtle)] hover:border-[var(--color-accent-blue)] transition-colors flex flex-col gap-3"
                                >
                                    <div className="relative w-full h-32 bg-[var(--color-bg-secondary)] rounded-lg overflow-hidden">
                                        <img src={item.image || `https://via.placeholder.com/150?text=${item.name}`} alt={item.name} className="w-full h-full object-cover" />
                                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full text-white text-xs font-medium">
                                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                            {item.rating ? item.rating.toFixed(1) : '4.5'}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-mono text-[var(--color-accent-blue)] uppercase tracking-wider mb-1">{item.category}</p>
                                        <h3 className="text-base font-medium text-[var(--color-text-primary)]">{item.name}</h3>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-1 text-[var(--color-text-secondary)]">
                                            <MapPin className="w-4 h-4" />
                                            <span>{item.location || 'Global'}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <TrendingUp className="w-4 h-4 text-[var(--color-accent-green)]" />
                                            <span className="font-bold text-[var(--color-accent-green)]">{item.trend_score}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
}
