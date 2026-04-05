import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, ChevronRight, BarChart3, TrendingDown, 
  Smartphone, Search, ShieldCheck, Cpu, ArrowRight,
  Code, Rocket
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SLIDES = [
  {
    id: 0,
    title: "Don't just shop. Analyze intelligently.",
    subtitle: "Your autonomous agentic search engine.",
    description: "Hunts down real-time prices from Amazon, Flipkart, and Official Brand Stores.",
    icon: <Search className="w-12 h-12 text-[var(--color-accent-cyan)]" />,
    color: "from-cyan-500/20 to-blue-500/20"
  },
  {
    id: 1,
    title: "Deep Hardware Benchmarks",
    subtitle: "Powered by AI",
    description: "Get nanoreview-style ratings out of 10 for Sensors, Processors, Display Quality, and Build Materials.",
    icon: <Cpu className="w-12 h-12 text-purple-400" />,
    color: "from-purple-500/20 to-pink-500/20"
  },
  {
    id: 2,
    title: "Historical Price Curves",
    subtitle: "Beat manipulative marketing",
    description: "Instantly view 6-month historical price graphs to see if the deal is genuinely cheap.",
    icon: <TrendingDown className="w-12 h-12 text-green-400" />,
    color: "from-green-500/20 to-emerald-500/20"
  },
  {
    id: 3,
    title: "Market Value Scoring",
    subtitle: "True value-for-money",
    description: "Calculates automated scores based on performance metrics against the lowest active price.",
    icon: <BarChart3 className="w-12 h-12 text-yellow-400" />,
    color: "from-yellow-500/20 to-orange-500/20"
  }
];

// Reusable Desktop Card
const FeatureCard = ({ icon: Icon, title, desc, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ delay, duration: 0.5 }}
    className="ss-card p-8 group hover:-translate-y-2 transition-all duration-300 relative overflow-hidden bg-[var(--color-bg-secondary)]/50 border border-[var(--color-border-subtle)] backdrop-blur-sm rounded-3xl"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-accent-cyan)]/10 rounded-bl-full translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-500 ease-out z-0" />
    <div className="relative z-10">
      <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent-cyan)]/10 text-[var(--color-accent-cyan)] flex items-center justify-center mb-6 group-hover:bg-[var(--color-accent-cyan)] group-hover:text-[var(--color-bg-primary)] transition-colors">
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">{title}</h4>
      <p className="text-[var(--color-text-secondary)] leading-relaxed">{desc}</p>
    </div>
  </motion.div>
);

export default function LandingPage() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = () => setSlideIndex((prev) => Math.min(prev + 1, SLIDES.length - 1));
  const prevSlide = () => setSlideIndex((prev) => Math.max(prev - 1, 0));

  const currentSlide = SLIDES[slideIndex];

  if (isMobile) {
    // --- MOBILE APP-LIKE ONBOARDING ---
    return (
      <div className="fixed inset-0 bg-[var(--color-bg-primary)] flex flex-col justify-between overflow-hidden touch-none">
        {/* Dynamic Background */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`bg-${slideIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className={`absolute inset-0 bg-gradient-to-br ${currentSlide.color} opacity-40 blur-[100px] -z-10`}
          />
        </AnimatePresence>

        {/* Top Header */}
        <header className="flex justify-between items-center p-6 relative z-10 w-full pt-10">
          <div className="flex items-center gap-2">
             <div className="bg-[var(--color-accent-cyan)]/20 p-2 rounded-xl backdrop-blur-md">
               <Zap className="w-5 h-5 text-[var(--color-accent-cyan)]" />
             </div>
             <span className="font-black text-lg">ShopSense<span className="text-[var(--color-accent-cyan)]">.AI</span></span>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-sm font-semibold text-[var(--color-text-secondary)] opacity-80 active:opacity-100"
          >
            Skip
          </button>
        </header>

        {/* Swipeable Carousel */}
        <div className="flex-1 w-full relative flex items-center shadow-inner">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={slideIndex}
              initial={{ x: 100, opacity: 0, scale: 0.95 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: -100, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = offset.x;
                if (swipe < -50) nextSlide();
                else if (swipe > 50) prevSlide();
              }}
              className="absolute inset-x-0 flex flex-col items-center text-center px-8"
            >
              <div className="mb-8 p-6 rounded-full bg-white/5 border border-white/10 shadow-2xl backdrop-blur-xl group relative">
                {currentSlide.icon}
                <div className={`absolute inset-0 bg-gradient-to-br ${currentSlide.color} blur-2xl -z-10 opacity-50 rounded-full`} />
              </div>
              <h1 className="text-3xl font-black mb-3 leading-tight tracking-tight">
                {currentSlide.title}
              </h1>
              <h2 className="text-[var(--color-accent-cyan)] font-bold mb-4 font-mono text-sm uppercase tracking-widest">
                {currentSlide.subtitle}
              </h2>
              <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
                {currentSlide.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Actions */}
        <div className="p-8 pb-12 w-full z-10 flex flex-col items-center gap-6 bg-gradient-to-t from-[var(--color-bg-primary)] via-[var(--color-bg-primary)] to-transparent">
          {/* Pagination Dots */}
          <div className="flex gap-2 mb-2">
            {SLIDES.map((_, i) => (
              <motion.div
                key={i}
                className="h-2 rounded-full transition-all duration-300"
                animate={{
                  width: i === slideIndex ? 24 : 8,
                  backgroundColor: i === slideIndex ? 'var(--color-accent-cyan)' : 'var(--color-border-subtle)',
                }}
              />
            ))}
          </div>

          {slideIndex === SLIDES.length - 1 ? (
             <motion.button
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => navigate('/dashboard')}
               className="w-full py-4 rounded-2xl bg-[var(--color-accent-cyan)] text-[var(--color-bg-primary)] font-bold text-lg flex items-center justify-center shadow-[0_0_40px_-10px_var(--color-accent-cyan)]"
             >
               Launch App <ArrowRight className="w-5 h-5 ml-2" />
             </motion.button>
          ) : (
            <div className="w-full flex justify-between items-center text-sm font-bold">
               <button onClick={prevSlide} className={`p-4 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] ${slideIndex === 0 ? 'opacity-0 pointer-events-none' : ''}`}>
                 <ChevronRight className="w-5 h-5 rotate-180" />
               </button>
               <button 
                 onClick={nextSlide} 
                 className="flex-1 ml-4 py-4 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur-sm border border-white/10 transition-colors flex justify-center items-center gap-2"
               >
                 Next <ChevronRight className="w-5 h-5" />
               </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- DESKTOP PREMIUM SCROLL EXPERIENCE ---
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] relative overflow-x-hidden">
      {/* Background Orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[var(--color-accent-cyan)] opacity-10 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-500 opacity-5 blur-[150px] pointer-events-none" />
      <div className="fixed top-[20%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-blue-500 opacity-5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-7xl mx-auto flex items-center justify-between p-6 relative z-20"
      >
        <div className="flex items-center gap-3">
          <div className="bg-[var(--color-accent-cyan)]/20 p-2.5 rounded-xl border border-[var(--color-accent-cyan)]/30 backdrop-blur-md">
            <Zap className="w-6 h-6 text-[var(--color-accent-cyan)]" />
          </div>
          <span className="font-black tracking-tight text-2xl bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-text-primary)] to-[var(--color-text-muted)]">
            ShopSense<span className="text-[var(--color-accent-cyan)]">.AI</span>
          </span>
        </div>

      </motion.header>

      <main className="w-full relative z-10 px-6 sm:px-12 flex flex-col items-center">
        {/* Hero */}
        <section className="max-w-5xl mx-auto pt-24 pb-32 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-accent-cyan)]/30 bg-[var(--color-accent-cyan)]/10 mb-8 backdrop-blur-md"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent-cyan)] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--color-accent-cyan)]" />
            </span>
            <span className="text-xs font-mono text-[var(--color-accent-cyan)] uppercase tracking-widest font-semibold">
              v2.0 : AI Powered
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.05] pb-4"
          >
            Don't just shop. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-cyan)] to-blue-500">
              Analyze intelligently.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-xl text-[var(--color-text-secondary)] max-w-3xl leading-relaxed mx-auto font-medium"
          >
            An autonomous agentic search engine that hunts down real-time prices, analyzes deep hardware benchmarks using <strong className="text-[var(--color-text-primary)]">Llama/Gemini AI</strong>, and generates definitive verdicts.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex gap-6 justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px -10px var(--color-accent-cyan)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/dashboard')}
              className="group relative flex items-center justify-center gap-3 px-10 py-5 text-lg font-bold text-[var(--color-bg-primary)] bg-[var(--color-accent-cyan)] rounded-full overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Search className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Start Analyzing Now</span>
              <ChevronRight className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </motion.div>
        </section>

        {/* Features Grid Desktop */}
        <section className="py-32 w-full max-w-7xl mx-auto border-t border-[var(--color-border-subtle)]/30" id="features">
          <div className="text-center mb-20">
            <h2 className="text-xs font-mono text-[var(--color-accent-cyan)] uppercase tracking-widest mb-4">Core Capabilities</h2>
            <h3 className="text-4xl md:text-5xl font-black tracking-tight">More than a search engine.</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={Rocket} title="Agentic Web Scraping" desc="Extracts live pricing, out-of-stock data, and hidden bank offers." delay={0.1} />
            <FeatureCard icon={Cpu} title="Deep Benchmarks" desc="Get ratings out of 10 for Sensors, Processors, and Build Materials." delay={0.2} />
            <FeatureCard icon={TrendingDown} title="Historical Price Curves" desc="Instantly view a 6-month historical graph." delay={0.3} />
            <FeatureCard icon={BarChart3} title="Market Value Scoring" desc="Calculates true value-for-money against lowest active price." delay={0.4} />
            <FeatureCard icon={ShieldCheck} title="Verified Stores" desc="Prioritizes fetching prices straight from official brand stores." delay={0.5} />
            <FeatureCard icon={Code} title="AI Powered" desc="Configurable to use the best AI models for deep insights." delay={0.6} />
          </div>
        </section>
      </main>

      {/* Footer Desktop */}
      <footer className="w-full relative z-10 bg-[var(--color-bg-secondary)]/50 pt-16 pb-8 px-6 sm:px-12 backdrop-blur-xl border-t border-[var(--color-border-subtle)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center pb-12 mb-8 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-[var(--color-accent-cyan)]" />
            <span className="font-black text-xl">ShopSense<span className="text-[var(--color-accent-cyan)]">.AI</span></span>
          </div>
        </div>
        <div className="w-full text-center text-xs font-mono tracking-widest text-[var(--color-text-muted)]">
          &copy; {new Date().getFullYear()} ShopSense AI Engine
        </div>
      </footer>
    </div>
  );
}
