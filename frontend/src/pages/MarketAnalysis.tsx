import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Cpu, ArrowRight, Camera, Smartphone, Activity, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { useSearch } from '../context/SearchContext';

export default function MarketAnalysisPage() {
  const { phoneAdvice } = useSearch();
  const rows = phoneAdvice?.hardwareBenchmarks || [];
  const metrics = phoneAdvice?.benchmarks || [];
  
  const [activeArea, setActiveArea] = useState<string | null>(null);

  if (!phoneAdvice || !rows.length) {
    return (
      <div className="flex-1 p-8 flex flex-col items-center justify-center min-h-[420px] text-center max-w-md mx-auto">
        <Globe className="w-14 h-14 text-[var(--color-text-muted)] mb-4 opacity-40" />
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">No analysis yet</h2>
        <p className="text-[var(--color-text-muted)] mt-2 text-sm">
          Run the product finder on the dashboard first. We’ll surface detailed hardware benchmarks here.
        </p>
        <Link to="/dashboard" className="mt-6 ss-btn-primary no-underline inline-flex items-center gap-2 text-sm">
          Go to dashboard
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const title = `${phoneAdvice.selectedVariant.brand} ${phoneAdvice.selectedVariant.model}`;
  const sub = `${phoneAdvice.selectedVariant.ram || 'Unknown RAM'} · ${phoneAdvice.selectedVariant.storage || 'Unknown Storage'}`;
  const isPhone = phoneAdvice.category === 'phone' || !phoneAdvice.category;

  // Prepare data for the spider graph
  const chartData = rows.map((r) => ({
    subject: r.area.replace(' & ', '\n'), 
    score: r.score,
    fullMark: 10
  }));

  const renderProgressBar = (score: number, max: number = 10, isActive: boolean = false) => {
    const percentage = Math.min(100, Math.max(0, (score / max) * 100));
    return (
      <div className="w-full bg-[var(--color-border-subtle)] h-1.5 mt-3 rounded-full overflow-hidden flex relative">
        <motion.div
           initial={{ width: 0 }}
           animate={{ width: `${percentage}%` }}
           transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
           className={`h-full rounded-full relative transition-colors duration-300 ${isActive ? 'bg-[var(--color-accent-cyan)]' : 'bg-[var(--color-text-muted)]'}`}
        >
          <div className="absolute inset-0 bg-white/20 w-full h-full" style={{ maskImage: 'linear-gradient(90deg, transparent, black)' }} />
        </motion.div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex-1 p-6 max-w-6xl mx-auto w-full pb-16"
    >
      <header className="mb-8">
        <p className="ss-eyebrow mb-2">Technical Breakdown</p>
        <h1 className="text-3xl md:text-5xl font-bold text-[var(--color-text-primary)] flex flex-wrap items-center gap-3">
          <Globe className="w-8 h-8 md:w-10 md:h-10 text-[var(--color-accent-cyan)] shrink-0" />
          {title}
        </h1>
        <p className="text-[var(--color-text-muted)] font-mono text-sm mt-3 px-3 py-1 bg-[var(--color-bg-secondary)] rounded-md inline-block">{sub}</p>
        <p className="mt-4 text-[var(--color-text-secondary)] text-sm md:text-base max-w-3xl leading-relaxed border-l-2 border-[var(--color-accent-cyan)] pl-4">
          {phoneAdvice.insight}
        </p>
      </header>

      <div className="grid lg:grid-cols-12 gap-6 mb-8">
        
        {/* Radar Spider Graph Section */}
        <div className="ss-card p-6 lg:col-span-5 flex flex-col items-center justify-center relative overflow-hidden group">
           <div className="absolute top-6 left-6 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--color-accent-cyan)]" />
              <h2 className="text-xs font-mono uppercase tracking-widest text-[var(--color-text-muted)]">
                Performance Web
              </h2>
           </div>
           
           <div className="w-full h-[350px] mt-8 z-10 transition-transform duration-500 hover:scale-[1.02]">
             <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                   <PolarGrid stroke="var(--color-border-subtle)" strokeDasharray="3 3" />
                   <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: 'var(--color-text-secondary)', fontSize: 11, fontWeight: 500 }} 
                   />
                   <PolarRadiusAxis angle={30} domain={[0, 10]} max={10} tick={false} axisLine={false} />
                   <Radar 
                      name={title} 
                      dataKey="score" 
                      stroke="var(--color-accent-cyan)" 
                      strokeWidth={2}
                      fill="var(--color-accent-cyan)" 
                      fillOpacity={0.3} 
                   />
                   <RechartsTooltip 
                     contentStyle={{ 
                        backgroundColor: 'var(--color-bg-primary)', 
                        borderColor: 'var(--color-border-subtle)',
                        borderRadius: '12px',
                        backdropFilter: 'blur(10px)',
                        padding: '12px',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                     }}
                     itemStyle={{ color: 'var(--color-text-primary)', fontWeight: 'bold' }}
                     formatter={(value: any) => [`${value} / 10`, 'Score']}
                   />
                </RadarChart>
             </ResponsiveContainer>
           </div>
           
           {/* Ambient subtle glow behind the chart */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--color-accent-cyan)]/5 rounded-full blur-3xl -z-1" />
        </div>

        {/* Detailed Hardware Gists List */}
        <div className="lg:col-span-7 flex flex-col gap-4">
           <div className="flex items-center gap-2 px-1">
             <Cpu className="w-4 h-4 text-[var(--color-accent-cyan)]" />
             <h2 className="text-xs font-mono uppercase tracking-widest text-[var(--color-text-muted)]">
               Core Hardware Analysis
             </h2>
           </div>
           <div className="grid sm:grid-cols-2 gap-4">
             {rows.map((row, idx) => (
                <motion.div 
                   key={row.area} 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: idx * 0.1 }}
                   onMouseEnter={() => setActiveArea(row.area)}
                   onMouseLeave={() => setActiveArea(null)}
                   className={`ss-card p-5 cursor-pointer border transition-all duration-300 ${
                      activeArea === row.area 
                        ? 'border-[var(--color-accent-cyan)] bg-[var(--color-bg-secondary)]' 
                        : 'border-[var(--color-border-subtle)] hover:border-[var(--color-border-focus)]'
                   }`}
                >
                   <div className="flex justify-between items-start mb-2">
                     <h3 className="font-bold text-sm text-[var(--color-text-primary)]">{row.area}</h3>
                     <span className={`text-lg font-black tabular-nums transition-colors duration-300 ${
                        activeArea === row.area ? 'text-[var(--color-accent-cyan)]' : 'text-[var(--color-text-primary)]'
                     }`}>
                        {row.score.toFixed(1)}<span className="text-[10px] text-[var(--color-text-muted)] font-normal ml-0.5">/10</span>
                     </span>
                   </div>
                   <p className="text-xs text-[var(--color-text-muted)] leading-relaxed mt-2 min-h-[40px]">
                     {row.detail}
                   </p>
                   {renderProgressBar(row.score, 10, activeArea === row.area)}
                </motion.div>
             ))}
           </div>
        </div>
      </div>
      
      {/* Overview Metrics (Bottom Bar) */}
      <h2 className="text-xs font-mono uppercase tracking-widest text-[var(--color-text-muted)] mb-4 flex items-center gap-2 mt-12 w-full pt-8 border-t border-[var(--color-border-subtle)]">
         <Zap className="w-4 h-4 text-[var(--color-accent-cyan)]" />
         Auxiliary Metrics
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
         {metrics.map((m, idx) => (
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: idx * 0.05 + 0.3 }}
               key={m.metric} 
               className="bg-[var(--color-bg-secondary)] rounded-xl p-4 flex flex-col items-center text-center justify-center border border-[var(--color-border-subtle)]"
            >
               <span className="text-2xl font-black text-[var(--color-text-primary)] tabular-nums mb-1">{m.score}</span>
               <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">{m.metric}</span>
            </motion.div>
         ))}
      </div>

      <div className="flex flex-wrap gap-3 mt-12 pt-4">
        <Link
          to="/dashboard/trends"
          className="ss-card px-5 py-3 text-sm font-medium inline-flex items-center gap-2 no-underline hover:border-[var(--color-accent-cyan)] hover:text-[var(--color-accent-cyan)] transition-colors border border-[var(--color-border-subtle)]"
        >
          View 6-month price trend
        </Link>
        <Link to="/dashboard" className="text-sm font-mono text-[var(--color-text-muted)] hover:text-[var(--color-accent-cyan)] mt-3 sm:ml-auto transition-colors">
          ← Back to Search Hub
        </Link>
      </div>
    </motion.div>
  );
}
