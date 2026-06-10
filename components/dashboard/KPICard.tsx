'use client';

import React, { useEffect, useState } from 'react';
import { useCarbon } from '../../context/CarbonContext';
import { UserProfile } from '../../types';

interface KPICardProps {
  category: string;
  emoji: string;
  co2Value: number;
  percentage: number;
  colorClass: string; // Preserved for interface signature compatibility
}

export default function KPICard({
  category,
  emoji,
  co2Value,
}: KPICardProps) {
  const { state } = useCarbon();
  const [count, setCount] = useState(0);
  const [progressWidth, setProgressWidth] = useState(0);

  // Stats count-up animation on mount (800ms)
  useEffect(() => {
    let start = 0;
    const end = co2Value;
    if (end === 0) {
      setCount(0);
      return;
    }
    
    const duration = 800; // ms
    const incrementTime = Math.max(Math.floor(duration / Math.max(end, 1)), 10);
    
    const timer = setInterval(() => {
      start += end / (duration / incrementTime);
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(Number(start.toFixed(1)));
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [co2Value]);

  // Determine top border color and glow matching category
  const getCategoryThemeColor = (cat: string) => {
    const norm = cat.toLowerCase();
    if (norm.includes('transport')) return '#3B82F6';
    if (norm.includes('food')) return '#EF4444';
    if (norm.includes('energy')) return '#F59E0B';
    if (norm.includes('shopping')) return '#10B981';
    if (norm.includes('travel') || norm.includes('flight')) return '#8B5CF6';
    return '#8899AA';
  };
  const themeColor = getCategoryThemeColor(category);

  // Calculate dynamic budget based on profile
  const getCategoryBaseline = (cat: string, profile: UserProfile | null) => {
    const norm = cat.toLowerCase();
    let annual = 1000;
    if (norm.includes('transport')) {
      switch (profile?.transport) {
        case 'Petrol Car': annual = 2100; break;
        case 'Diesel Car': annual = 2700; break;
        case 'Two-wheeler': annual = 900; break;
        case 'Public Transit': annual = 320; break;
        case 'Walk/Cycle': annual = 0; break;
        case 'EV': annual = 400; break;
        default: annual = 2100;
      }
    } else if (norm.includes('food') || norm.includes('diet')) {
      switch (profile?.diet) {
        case 'Heavy meat (daily)': annual = 2500; break;
        case 'Mixed (meat 3–4x/week)': annual = 1500; break;
        case 'Vegetarian': annual = 900; break;
        case 'Vegan': annual = 500; break;
        default: annual = 1500;
      }
    } else if (norm.includes('energy')) {
      switch (profile?.energy) {
        case 'Grid only': annual = 984; break;
        case 'Solar + Grid': annual = 492; break;
        case 'Fully renewable': annual = 120; break;
        case 'LPG/Kerosene heavy use': annual = 1200; break;
        default: annual = 984;
      }
    } else if (norm.includes('travel') || norm.includes('flight')) {
      switch (profile?.flights) {
        case 'None': annual = 0; break;
        case '1–2 flights': annual = 500; break;
        case '3–5 flights': annual = 1400; break;
        case '6+ flights': annual = 3000; break;
        default: annual = 500;
      }
    } else if (norm.includes('shopping')) {
      switch (profile?.shopping) {
        case 'Minimal': annual = 200; break;
        case 'Moderate': annual = 600; break;
        case 'Frequent': annual = 1200; break;
        case 'Very frequent (weekly online orders)': annual = 2000; break;
        default: annual = 600;
      }
    }
    return Math.max(annual / 12, 10); // monthly budget
  };

  const budgetLimit = getCategoryBaseline(category, state.profile);
  const budgetPercent = (co2Value / budgetLimit) * 100;

  // Mount animation for progress bar width
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgressWidth(Math.min(budgetPercent, 100));
    }, 100);
    return () => clearTimeout(timer);
  }, [budgetPercent]);

  // Determine progress bar fill color
  // green under budget (<80%), amber close (80%-100%), red/coral over (>=100%)
  let progressBarColor = '#00FF87'; // green
  if (budgetPercent >= 80 && budgetPercent < 100) {
    progressBarColor = '#FFB347'; // amber
  } else if (budgetPercent >= 100) {
    progressBarColor = '#FF6B6B'; // red/coral
  }

  // Determine percentage badge styling by urgency:
  // > 60% of baseline budget: soft coral/red badge
  // 30–60%: amber badge
  // < 30%: green badge
  let badgeBg = 'rgba(0, 255, 135, 0.1)';
  let badgeColor = '#00FF87';
  let badgeBorder = '1px solid rgba(0, 255, 135, 0.3)';

  if (budgetPercent > 60) {
    badgeBg = 'rgba(255, 107, 107, 0.1)';
    badgeColor = '#FF6B6B';
    badgeBorder = '1px solid rgba(255, 107, 107, 0.3)';
  } else if (budgetPercent >= 30 && budgetPercent <= 60) {
    badgeBg = 'rgba(255, 179, 71, 0.1)';
    badgeColor = '#FFB347';
    badgeBorder = '1px solid rgba(255, 179, 71, 0.3)';
  }

  return (
    <div
      className="glass-panel rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-white/20 transition-all duration-300 relative overflow-hidden"
      style={{
        borderTop: `3px solid ${themeColor}`,
        boxShadow: `0 -1px 0 0 rgba(255,255,255,0.05), inset 0 4px 12px -2px ${themeColor}1a`
      }}
      aria-label={`${category} emissions: ${co2Value} kg CO₂. ${Math.round(budgetPercent)}% of category budget.`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <span className="text-xl" role="img" aria-hidden="true">
            {emoji}
          </span>
          <h3 className="font-display text-sm font-semibold text-frost capitalize">
            {category}
          </h3>
        </div>
        <span 
          className="font-data text-xs font-semibold px-2.5 py-0.5 rounded-full"
          style={{
            backgroundColor: badgeBg,
            color: badgeColor,
            border: badgeBorder,
          }}
        >
          {Math.round(budgetPercent)}%
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline space-x-1">
          <span className="font-data text-2xl md:text-3xl font-bold text-frost tracking-tight">
            {count.toFixed(1)}
          </span>
          <span className="font-body text-xs text-muted">kg CO₂</span>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden" aria-hidden="true">
          <div
            className="h-full rounded-full"
            style={{
              width: `${progressWidth}%`,
              backgroundColor: progressBarColor,
              transition: 'width 800ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
