import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import LandingPage from './pages/LandingPage';
import Layout from './components/Layout';
import Home from './pages/Home';
import MarketAnalysisPage from './pages/MarketAnalysis';
import PriceHistoryPage from './pages/PriceHistory';
import Explore from './pages/Explore';
import Trends from './pages/Trends';
import Alerts from './pages/Alerts';
import Messages from './pages/Messages';
import Activity from './pages/Activity';
import Profile from './pages/Profile';

// Wrapper component to handle routing animations
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        {/* Public Landing Page (No Layout) */}
        <Route path="/" element={<LandingPage />} />

        {/* Dashboard Routes (With Layout) */}
        <Route path="/dashboard/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/market-analysis" element={<MarketAnalysisPage />} />
              <Route path="/price-history" element={<PriceHistoryPage />} />
              <Route path="/trends" element={<Trends />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/activity" element={<Activity />} />
              <Route path="/profile" element={<Profile />} />
              {/* Fallback inside dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        } />

        {/* Catch-all redirect to Landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return <AnimatedRoutes />;
}

