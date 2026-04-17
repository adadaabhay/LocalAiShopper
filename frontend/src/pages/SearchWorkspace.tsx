import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Loader2, ChevronRight, CheckCircle2, Sparkles, Wand2,
  Smartphone, Laptop, Tablet, Watch, Headphones, Tv, Camera, Monitor,
  Speaker, Gamepad2, Cpu, Router, Wrench, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSearch } from '../context/SearchContext';
import { categories, categoryLabels, getDefaultBrands, getRamOptions, getStorageOptions, ProductCategory } from '@ui/constants';
import clsx from 'clsx';

function ChoicePills({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button key={option} type="button" onClick={() => onChange(option)} className={`ss-chip ${value === option ? 'ss-chip-active' : ''}`}>
          {option}
        </button>
      ))}
    </div>
  );
}

function formatPrice(val: number | null | undefined) {
  if (!val) return 'N/A';
  return `INR ${val.toLocaleString('en-IN')}`;
}

const CategoryIconMap: Record<ProductCategory, React.FC<any>> = {
  phone: Smartphone,
  laptop: Laptop,
  tablet: Tablet,
  smartwatch: Watch,
  earbuds: Headphones,
  headphones: Headphones,
  tv: Tv,
  camera: Camera,
  monitor: Monitor,
  desktop: Monitor,
  gpu: Cpu,
  router: Router,
  speaker: Speaker,
  console: Gamepad2,
};

export default function SearchWorkspace() {
  const navigate = useNavigate();
  const {
    draft,
    updateDraft,
    discovery,
    setDiscovery,
    selectedVariant,
    setSelectedVariant,
    setPhoneAdvice,
  } = useSearch();

  const [step, setStep] = useState<'category' | 'query' | 'variants'>('category');
  const [discovering, setDiscovering] = useState(false);
  const [showManual, setShowManual] = useState(false);

  // Auto-advance logic if returning to this page but variant is already picked
  useEffect(() => {
    if (selectedVariant) {
      setStep('variants');
    }
  }, []);

  const brandOptions = useMemo(() => getDefaultBrands(draft.category), [draft.category]);
  const ramOptions = useMemo(() => getRamOptions(draft.category), [draft.category]);
  const storageOptions = useMemo(() => getStorageOptions(draft.category), [draft.category]);

  function handleSelectCategory(cat: ProductCategory) {
    updateDraft({ category: cat, brand: '', model: '', ram: getRamOptions(cat)[0], storage: getStorageOptions(cat)[0] });
    setDiscovery(null);
    setSelectedVariant(null);
    setPhoneAdvice(null);
    setShowManual(false);
    setStep('query');
  }

  async function handleDiscover(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.brand.trim() || !draft.model.trim()) {
      toast.error('Enter brand and model.');
      return;
    }

    setDiscovering(true);
    setDiscovery(null);
    setSelectedVariant(null);
    setPhoneAdvice(null);
    setStep('variants');

    try {
      const res = await fetch('/api/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: draft.brand.trim(),
          model: draft.model.trim(),
          category: draft.category,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Discovery failed.');
      
      setDiscovery(payload);
      const hasVariants = payload.variants?.length > 0;
      toast.success(hasVariants ? `Found ${payload.variants.length} variant(s).` : 'No exact variants detected natively.');
      
      if (!hasVariants) {
        setShowManual(true);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Discovery failed.');
      setShowManual(true);
    } finally {
      setDiscovering(false);
    }
  }

  function handlePickVariant(variant: any) {
    setSelectedVariant(variant);
    updateDraft({
      ram: variant.ram || 'Unknown',
      storage: variant.storage || 'Unknown',
      directUrl: variant.url || '',
    });
  }

  function handleContinue() {
    if (!draft.brand.trim() || !draft.model.trim()) {
      toast.error('Enter brand and model first.');
      return;
    }
    navigate('/dashboard/analysis');
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto w-full p-5 sm:p-7 pb-24 space-y-10">
      
      {/* Header Profile */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--color-border-subtle)]">
        <div className="max-w-2xl">
          <p className="ss-eyebrow mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--color-accent-blue)]" />
            Product Reconnaissance
          </p>
          <h1 className="ss-display text-4xl md:text-5xl font-semibold leading-tight tracking-tight">
            Discover the exact variant matching your needs
          </h1>
          <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
            Our AI automatically scrapes live marketplaces to pull real configurations. Pick a dynamic listing below to ensure the deepest accuracy.
          </p>
        </div>
        
        {/* Step Indicator */}
        <div className="flex gap-2 p-1.5 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-hover)]/30 backdrop-blur-md shrink-0">
          <button onClick={() => setStep('category')} className={clsx("px-4 py-2 text-sm font-medium rounded-full transition-all", step === 'category' ? "bg-[var(--color-bg-elevated)] text-[var(--color-accent-cyan)] shadow-sm" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]")}>1. Type</button>
          <button onClick={() => setStep('query')} className={clsx("px-4 py-2 text-sm font-medium rounded-full transition-all", step === 'query' ? "bg-[var(--color-bg-elevated)] text-[var(--color-accent-cyan)] shadow-sm" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]")}>2. Query</button>
          <button onClick={() => setStep('variants')} className={clsx("px-4 py-2 text-sm font-medium rounded-full transition-all", step === 'variants' ? "bg-[var(--color-bg-elevated)] text-[var(--color-accent-cyan)] shadow-sm" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]")}>3. Variants</button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        
        {/* STEP 1: CATEGORY */}
        {step === 'category' && (
          <motion.section 
            key="category"
            initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }}
            className="space-y-6"
          >
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-4">Select Equipment Type</p>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
                {categories.map((cat) => {
                  const Icon = CategoryIconMap[cat] || Laptop;
                  const isActive = draft.category === cat;
                  
                  return (
                    <button
                      key={cat}
                      onClick={() => handleSelectCategory(cat)}
                      className={clsx(
                        "flex flex-col items-center justify-center p-5 rounded-[1.25rem] border transition-all duration-300",
                        isActive 
                          ? "border-[var(--color-accent-cyan)] bg-[var(--color-accent-cyan)]/10 text-[var(--color-accent-cyan)] ss-glow"
                          : "border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)] hover:border-[var(--color-text-muted)] hover:bg-[var(--color-bg-panel-hover)]"
                      )}
                    >
                      <Icon className={clsx("w-7 h-7 mb-3", isActive ? "text-[var(--color-accent-cyan)]" : "text-[var(--color-text-secondary)]")} strokeWidth={isActive ? 2.5 : 2} />
                      <span className={clsx("text-sm font-medium", isActive ? "text-[var(--color-accent-cyan)]" : "")}>{categoryLabels[cat]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.section>
        )}

        {/* STEP 2: BRAND & MODEL */}
        {step === 'query' && (
          <motion.section 
            key="query"
            initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-bg-panel-hover)] mb-4 border border-[var(--color-border-subtle)]">
                {React.createElement(CategoryIconMap[draft.category] || Laptop, { className: "w-8 h-8 text-[var(--color-text-primary)]" })}
              </div>
              <h2 className="text-3xl font-semibold">Which {categoryLabels[draft.category]}?</h2>
              <p className="mt-2 text-[var(--color-text-secondary)]">Enter exactly what you are looking for.</p>
            </div>

            <form onSubmit={handleDiscover} className="ss-card ss-panel-glow p-8 md:p-10 space-y-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-accent-blue)] to-[var(--color-accent-cyan)] opacity-20"></div>
              
               <div>
                <label className="block text-sm font-medium mb-3">Brand Name</label>
                <input 
                  className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-[1rem] px-5 py-4 text-lg focus:border-[var(--color-accent-blue)] focus:ring-1 focus:ring-[var(--color-accent-blue)] outline-none transition-all"
                  value={draft.brand} 
                  onChange={(e) => updateDraft({ brand: e.target.value })} 
                  placeholder="e.g. Samsung, Sony, ASUS..." 
                />
                <div className="mt-4">
                  <ChoicePills options={brandOptions.slice(0, 6)} value={draft.brand} onChange={(value) => updateDraft({ brand: value })} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Model Number</label>
                <input 
                  className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-[1rem] px-5 py-4 text-lg focus:border-[var(--color-accent-blue)] focus:ring-1 focus:ring-[var(--color-accent-blue)] outline-none transition-all"
                  value={draft.model} 
                  onChange={(e) => updateDraft({ model: e.target.value })} 
                  placeholder="e.g. Galaxy S24 Ultra, Bravia 4K KD-55..." 
                  autoFocus
                />
              </div>

              <div className="pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
                <button type="button" onClick={() => setStep('category')} className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">
                  Back
                </button>
                <button type="submit" disabled={discovering || !draft.brand || !draft.model} className="ss-btn-primary px-8 py-4 text-base shadow-xl disabled:opacity-50 inline-flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  Auto-Discover Variants
                </button>
              </div>
            </form>
          </motion.section>
        )}

        {/* STEP 3: DISCOVERY RESULTS */}
        {step === 'variants' && (
          <motion.section 
            key="variants"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 15 }}
            className="space-y-8"
          >
            {/* Status Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--color-bg-panel)] p-6 rounded-[1.5rem] border border-[var(--color-border-subtle)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[var(--color-accent-cyan)]/10 flex items-center justify-center shrink-0">
                   {discovering ? <Loader2 className="w-6 h-6 text-[var(--color-accent-cyan)] animate-spin" /> : <CheckCircle2 className="w-6 h-6 text-[var(--color-accent-cyan)]" />}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{draft.brand} {draft.model}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {discovering ? 'Our AI is scanning live marketplaces...' : discovery?.variants?.length ? `Extracted ${discovery.variants.length} major configurations.` : 'Analysis finished.'}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { handleSelectCategory(draft.category) }} className="ss-btn-ghost text-sm">Start Over</button>
                {selectedVariant || showManual ? (
                  <button onClick={handleContinue} className="ss-btn-primary animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_20px_rgba(var(--color-accent-cyan-rgb),0.3)]">
                    Proceed to Analysis <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                ) : null}
              </div>
            </div>

            {/* Live Scraped Variants */}
            {discovery?.variants?.length ? (
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-4">Market Listings Found</p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {discovery.variants.map((variant, index) => {
                    const isSelected = selectedVariant === variant;
                    return (
                      <motion.button
                        key={`${variant.ram}-${variant.storage}-${index}`}
                        type="button"
                        whileHover={{ y: -4, scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePickVariant(variant)}
                        className={clsx(
                          "text-left relative p-6 rounded-[1.5rem] border transition-all duration-300 overflow-hidden",
                          isSelected 
                            ? "border-[var(--color-accent-cyan)] bg-[var(--color-bg-elevated)] ring-1 ring-[var(--color-accent-cyan)] shadow-xl" 
                            : "border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-hover)]/30 hover:border-[var(--color-text-muted)]"
                        )}
                      >
                        {isSelected && <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[var(--color-accent-cyan)]/20 to-transparent"></div>}
                        
                        <div className="flex justify-between items-start mb-4">
                          <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                            {variant.ram !== 'Unknown' ? `${variant.ram} / ` : ''}{variant.storage !== 'Unknown' ? variant.storage : 'Standard'}
                          </p>
                          {isSelected && <CheckCircle2 className="w-6 h-6 text-[var(--color-accent-cyan)] drop-shadow-sm" />}
                        </div>
                        
                        {variant.processor && <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-4">{variant.processor}</p>}
                        
                        <div className="mb-4">
                          <p className="text-[10px] uppercase font-mono tracking-widest text-[var(--color-text-muted)]">Lowest Live Price</p>
                          <p className="text-[1.35rem] font-semibold text-[var(--color-accent-soft)] tracking-tight">{formatPrice(variant.priceRange.min)}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-4 border-t border-[var(--color-border-subtle)]">
                          {variant.sources?.slice(0, 3).map((source) => (
                            <span key={source} className="rounded border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest text-[var(--color-text-muted)]">
                              {source}
                            </span>
                          ))}
                          {variant.sources?.length > 3 && <span className="text-xs text-[var(--color-text-muted)] self-center">+{variant.sources.length - 3}</span>}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Manual Override Fallback */}
            {!discovering && (
              <div className="mt-12 pt-8 border-t border-dashed border-[var(--color-border-subtle)]">
                {showManual ? (
                  <div className="bg-[var(--color-bg-panel-hover)] rounded-[1.5rem] border border-[var(--color-border-subtle)] p-6 md:p-8 space-y-6 relative overflow-hidden">
                    <div className="flex items-center gap-3 text-[var(--color-text-muted)] mb-2">
                       <Wrench className="w-5 h-5" />
                       <h3 className="font-medium text-lg">Build Model Manually</h3>
                    </div>
                    {(!discovery?.variants?.length) && <p className="text-sm text-[var(--color-accent-blue)]">Our scanner couldn't definitively match a variant. Please define the specs manually below to force the deep analysis.</p>}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--color-text-muted)] mb-3">Force RAM Spec</p>
                        <ChoicePills options={ramOptions} value={draft.ram} onChange={(value) => updateDraft({ ram: value })} />
                      </div>
                      <div>
                        <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--color-text-muted)] mb-3">Force Storage Spec</p>
                        <ChoicePills options={storageOptions} value={draft.storage} onChange={(value) => updateDraft({ storage: value })} />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="grid gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                        Inject Reference URL (Optional)
                        <input className="ss-input mt-1" type="url" value={draft.directUrl} onChange={(e) => updateDraft({ directUrl: e.target.value })} placeholder="https://www.amazon.in/dp/..." />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <button 
                      onClick={() => setShowManual(true)} 
                      className="text-sm border-b border-dashed border-[var(--color-text-muted)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors inline-flex items-center gap-2"
                    >
                      <Wrench className="w-4 h-4" /> Not seeing your model? Configure manually
                    </button>
                  </div>
                )}
              </div>
            )}
            
          </motion.section>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
