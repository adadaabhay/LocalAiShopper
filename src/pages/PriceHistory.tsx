import React from 'react';
import { TrendingDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { useSearch } from '../context/SearchContext';

export default function PriceHistoryPage() {
    const { productData } = useSearch();

    if (!productData) {
        return (
            <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[500px]">
                <TrendingDown className="w-16 h-16 text-[var(--color-border-strong)] mb-4 opacity-50" />
                <h2 className="text-2xl font-bold text-[var(--color-text-secondary)]">No Data Available</h2>
                <p className="text-[var(--color-text-muted)] mt-2">Please analyze a product on the Dashboard first.</p>
            </div>
        );
    }

    // Since the V2 API logic drops explicit history generation, we mock local UI noise to maintain visual hierarchy.
    const baseAmazon = productData.amazon_data.landed_cost || 50000;
    const baseFlipkart = productData.flipkart_data.landed_cost || 55000;

    const mockHistory = [
        { month: 'Oct', amazon: baseAmazon + 3000, flipkart: baseFlipkart + 4000 },
        { month: 'Nov', amazon: baseAmazon + 2000, flipkart: baseFlipkart + 2500 },
        { month: 'Dec', amazon: baseAmazon + 500, flipkart: baseFlipkart + 1000 },
        { month: 'Jan', amazon: baseAmazon - 1000, flipkart: baseFlipkart - 800 },
        { month: 'Feb', amazon: baseAmazon - 500, flipkart: baseFlipkart - 200 },
        { month: 'Mar', amazon: baseAmazon, flipkart: baseFlipkart }
    ];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col p-6 max-w-[1200px] mx-auto w-full">
            <h2 className="text-3xl font-extrabold text-[var(--color-text-primary)] mb-8 flex items-center gap-3">
                <TrendingDown className="w-8 h-8 text-[var(--color-accent-blue)]" /> True-Cost Price History: {productData.product_title}
            </h2>

            <div className="bg-[var(--color-bg-panel)] rounded-2xl p-8 border border-[var(--color-border-subtle)] flex-1 min-h-[500px] shadow-sm flex flex-col">
                <h3 className="text-lg font-bold text-[var(--color-text-secondary)] mb-6">6-Month Trend (Simulated)</h3>
                <div className="flex-1 h-full min-h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={mockHistory}>
                            <defs>
                                <linearGradient id="colorAmz" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#FF9900" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#FF9900" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorFlp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2874F0" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#2874F0" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
                            <XAxis dataKey="month" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                            <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} dx={-10} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--color-bg-panel)', borderColor: 'var(--color-border-strong)', borderRadius: '12px', color: 'var(--color-text-primary)' }}
                            />
                            <Area type="monotone" name="Amazon" dataKey="amazon" stroke="#FF9900" strokeWidth={3} fillOpacity={1} fill="url(#colorAmz)" />
                            <Area type="monotone" name="Flipkart" dataKey="flipkart" stroke="#2874F0" strokeWidth={3} fillOpacity={1} fill="url(#colorFlp)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </motion.div>
    );
}
