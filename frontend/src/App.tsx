import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Layout from './components/Layout';
import Home from './pages/Home';
import SearchWorkspace from './pages/SearchWorkspace';
import AnalysisPage from './pages/AnalysisPage';
import MarketAnalysisPage from './pages/MarketAnalysis';
import Trends from './pages/Trends';
import Activity from './pages/Activity';
import LandingPage from './pages/LandingPage';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<SearchWorkspace />} />
          <Route path="analysis" element={<AnalysisPage />} />
          <Route path="market-analysis" element={<MarketAnalysisPage />} />
          <Route path="trends" element={<Trends />} />
          <Route path="activity" element={<Activity />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return <AnimatedRoutes />;
}
