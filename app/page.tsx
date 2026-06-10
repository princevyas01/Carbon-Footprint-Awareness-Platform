'use client';

import React, { useState, useEffect } from 'react';
import EarthAura from '../components/dashboard/EarthAura';
import KPICard from '../components/dashboard/KPICard';
import DonutChart from '../components/dashboard/DonutChart';
import TrendChart from '../components/dashboard/TrendChart';
import ComparisonChart from '../components/dashboard/ComparisonChart';
import AILensCard from '../components/dashboard/AILensCard';
import EcoScoreWidget from '../components/dashboard/EcoScoreWidget';
import QuickLogFAB from '../components/dashboard/QuickLogFAB';
import ShareCard from '../components/shared/ShareCard';
import { useCarbonData } from '../hooks/useCarbonData';
import { useEcoScore } from '../hooks/useEcoScore';
import { Share2 } from 'lucide-react';

export default function DashboardPage() {
  const {
    monthlyTotal,
    lastMonthTotal,
    categoryBreakdown,
    categoryPercentages,
    chartData,
    lifetimeStats,
  } = useCarbonData();

  const { levelDetails } = useEcoScore();

  const [displayTotal, setDisplayTotal] = useState(0);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Big stat count-up animation on mount (800ms)
  useEffect(() => {
    let start = 0;
    const end = monthlyTotal;
    if (end === 0) {
      setDisplayTotal(0);
      return;
    }

    const duration = 800; // ms
    const incrementTime = 15; // ms
    const step = end / (duration / incrementTime);

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        clearInterval(timer);
        setDisplayTotal(end);
      } else {
        setDisplayTotal(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [monthlyTotal]);

  // Delta comparison to India Average (158 kg/month)
  const avgMonthly = 158;
  const isBelowAvg = monthlyTotal < avgMonthly;
  const deltaPercent = Math.abs(((monthlyTotal - avgMonthly) / avgMonthly) * 100);

  // Comparison chart data format
  const comparisonChartData = [
    { name: 'Last Month', co2: lastMonthTotal, fill: '#8899AA' },
    {
      name: 'This Month',
      co2: monthlyTotal,
      fill: monthlyTotal > avgMonthly ? '#FF6B6B' : '#00FF87',
    },
    { name: 'India Avg', co2: avgMonthly, fill: '#FFB347' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <section 
        className="relative flex flex-col items-center text-center py-10 md:py-16 overflow-visible rounded-3xl border border-border bg-space/20 backdrop-blur-md"
        aria-label="Carbon Footprint Hero Overview"
      >
        <EarthAura monthlyTotal={monthlyTotal} />

        {/* Share Button (Top Right) */}
        <button
          onClick={() => setIsShareOpen(true)}
          className="absolute top-4 right-4 p-2 bg-white/5 border border-border hover:bg-white/10 text-frost rounded-xl flex items-center gap-1.5 font-display text-xs transition-all duration-200"
          aria-label="Open Share Card Modal"
        >
          <Share2 className="h-4 w-4 text-green" /> Share Impact
        </button>

        {/* Big Stat */}
        <div className="relative z-[1] space-y-2">
          <p 
            className="font-display uppercase font-semibold text-[13px] tracking-[0.2em]"
            style={{ color: '#00FF87' }}
          >
            Monthly Footprint
          </p>
          <div className="flex flex-col items-center">
            <h1 className="font-data text-6xl md:text-7xl font-bold tracking-tight text-frost drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              {displayTotal.toFixed(1)}
            </h1>
            <span 
              className="font-body mt-1 text-[16px]"
              style={{ color: '#E8F4F1', textShadow: '0 0 12px rgba(0, 255, 135, 0.4)' }}
            >
              kg CO₂ equivalent
            </span>
          </div>

          {/* Delta Badge */}
          <div className="pt-2 flex justify-center">
            {isBelowAvg ? (
              <span className="text-[11px] bg-green/10 border border-green/30 text-green font-body font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                {deltaPercent.toFixed(0)}% below national average ✓
              </span>
            ) : (
              <span className="text-[11px] bg-coral/10 border border-coral/30 text-coral font-body font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                {deltaPercent.toFixed(0)}% above national average ⚠️
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Grid Dashboard Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: KPIs + Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* KPI grid (2x2) */}
          <div className="grid grid-cols-2 gap-4">
            <KPICard
              category="Transport"
              emoji="🚗"
              co2Value={categoryBreakdown.transport}
              percentage={categoryPercentages.transport}
              colorClass="bg-green"
            />
            <KPICard
              category="Food"
              emoji="🍽️"
              co2Value={categoryBreakdown.food}
              percentage={categoryPercentages.food}
              colorClass="bg-amber"
            />
            <KPICard
              category="Energy"
              emoji="⚡"
              co2Value={categoryBreakdown.energy}
              percentage={categoryPercentages.energy}
              colorClass="bg-green-dim"
            />
            <KPICard
              category="Travel"
              emoji="✈️"
              co2Value={categoryBreakdown.travel}
              percentage={categoryPercentages.travel}
              colorClass="bg-coral"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <DonutChart data={categoryBreakdown} />
            <TrendChart data={chartData} />
          </div>

          {/* AI Advisor Panel */}
          <AILensCard />
        </div>

        {/* Right Side: Score, Benchmarks, Actions */}
        <div className="space-y-6">
          <EcoScoreWidget />
          <ComparisonChart data={comparisonChartData} />

          {/* Mini Info Card */}
          <div className="glass-panel rounded-2xl p-5 space-y-3">
            <h3 className="font-display text-sm font-semibold text-muted">
              Did you know?
            </h3>
            <p className="font-body text-xs text-muted leading-relaxed">
              The average Indian resident emits roughly <strong>1.9 tonnes of CO₂</strong> annually. 
              By optimizing your local commute, switching to solar utilities, and reducing food wastage, 
              you can reduce emissions by up to <strong>40%</strong>!
            </p>
          </div>
        </div>
      </div>

      {/* Modals and floating action buttons */}
      <QuickLogFAB />
      {isShareOpen && (
        <ShareCard 
          monthlyCO2={monthlyTotal}
          levelName={levelDetails.level}
          levelIcon={levelDetails.icon}
          savedKg={Math.round(lifetimeStats.savedCo2)}
          onClose={() => setIsShareOpen(false)}
        />
      )}
    </div>
  );
}
