'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw, Sparkles, AlertCircle } from 'lucide-react';
import { useCarbon } from '../../context/CarbonContext';
import Skeleton from '../ui/Skeleton';
import { InsightResponse } from '../../types';

export default function AILensCard() {
  const { state } = useCarbon();

  const [insight, setInsight] = useState<InsightResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'loading' | 'live' | 'cached' | 'rate-limited' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  const [displayedObservation, setDisplayedObservation] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Cache key helper scoped per active user to support multiple profiles
  const getCacheKey = () => {
    return state.activeUser ? `carbonlens_last_insight_${state.activeUser.id}` : 'carbonlens_last_insight';
  };

  // Calculate monthly data inputs dynamically
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthLogs = state.logs.filter((log) => {
    const logDate = new Date(log.date);
    return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
  });

  const monthlyTotals = {
    transport: currentMonthLogs.filter((l) => l.category === 'transport').reduce((sum, l) => sum + l.co2, 0),
    food: currentMonthLogs.filter((l) => l.category === 'food').reduce((sum, l) => sum + l.co2, 0),
    energy: currentMonthLogs.filter((l) => l.category === 'energy').reduce((sum, l) => sum + l.co2, 0),
    shopping: currentMonthLogs.filter((l) => l.category === 'shopping').reduce((sum, l) => sum + l.co2, 0),
    travel: currentMonthLogs.filter((l) => l.category === 'travel').reduce((sum, l) => sum + l.co2, 0),
  };

  const categories = Object.entries(monthlyTotals) as [keyof typeof monthlyTotals, number][];
  const topCategory = categories.length > 0
    ? categories.reduce((max, curr) => (curr[1] > max[1] ? curr : max), categories[0])[0]
    : 'transport';

  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const lastMonthLogs = state.logs.filter((log) => {
    const logDate = new Date(log.date);
    return logDate.getMonth() === lastMonth && logDate.getFullYear() === lastMonthYear;
  });

  const lastMonthTotal = lastMonthLogs.reduce((sum, l) => sum + l.co2, 0);
  const thisMonthTotal = currentMonthLogs.reduce((sum, l) => sum + l.co2, 0);
  const monthDelta = lastMonthTotal > 0 ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100) : 0;

  const ecoScore = state.score;
  const getLevelName = (score: number) => {
    if (score >= 800) return 'Climate Champion';
    if (score >= 600) return 'Green Crusader';
    if (score >= 400) return 'Eco Warrior';
    if (score >= 200) return 'Earth Guardian';
    return 'Carbon Rookie';
  };
  const level = getLevelName(state.score);
  const profile = state.profile;

  const fetchInsight = async () => {
    setIsLoading(true);
    setStatus('loading');
    setError(null);

    try {
      const response = await fetch('/api/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyTotals,
          profile: profile ? {
            transport: profile.transport,
            diet: profile.diet,
            energy: profile.energy,
            flights: profile.flights,
            shopping: profile.shopping,
          } : {},
          topCategory,
          monthDelta,
          ecoScore,
          level
        })
      });

      if (response.status === 429) {
        // Rate limited — check headers/body or default to 300s
        try {
          const body = await response.json();
          if (body.retryAfter) {
            setCountdown(body.retryAfter);
          } else {
            setCountdown(300);
          }
        } catch {
          setCountdown(300);
        }

        const cached = localStorage.getItem(getCacheKey());
        if (cached) {
          setInsight(JSON.parse(cached));
          setStatus('cached');
        } else {
          setStatus('rate-limited');
        }
        return;
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.insight) {
        setInsight(data.insight);
        setStatus('live');
        // Cache the successful response
        localStorage.setItem(
          getCacheKey(),
          JSON.stringify(data.insight)
        );
      } else {
        throw new Error('No insight in response');
      }

    } catch (err) {
      console.error('AI fetch error:', err);
      // Try cache as fallback
      const cached = localStorage.getItem(getCacheKey());
      if (cached) {
        setInsight(JSON.parse(cached));
        setStatus('cached');
      } else {
        setStatus('error');
        setError(String(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch on mount/profile switch
  useEffect(() => {
    if (state.profile) {
      fetchInsight();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.activeUser?.id]);

  // Handle countdown decrement
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Typewriter effect for observation text (30ms per character)
  useEffect(() => {
    if (!insight?.observation) {
      setDisplayedObservation('');
      return;
    }

    setDisplayedObservation('');
    let index = 0;
    const text = insight.observation;
    
    const interval = setInterval(() => {
      setDisplayedObservation((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [insight?.observation]);

  const handleManualRefresh = async () => {
    if (countdown > 0 || isLoading) return;
    await fetchInsight();
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const getStatusIndicator = () => {
    switch (status) {
      case 'loading':
        return (
          <span className="text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400"></span>
            </span>
            Analyzing...
          </span>
        );
      case 'live':
        return (
          <span className="text-[10px] bg-green-500/10 border border-green-500/30 text-[#00FF87] px-2 py-0.5 rounded-full flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF87] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00FF87]"></span>
            </span>
            Live
          </span>
        );
      case 'cached':
        return (
          <span className="text-[10px] bg-gray-500/10 border border-gray-500/30 text-zinc-300 px-2 py-0.5 rounded-full flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
            Cached
          </span>
        );
      case 'rate-limited':
        return (
          <span className="text-[10px] bg-gray-500/10 border border-gray-500/30 text-zinc-300 px-2 py-0.5 rounded-full flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
            Rate limited — try in 5 min
          </span>
        );
      case 'error':
      default:
        return (
          <span className="text-[10px] bg-red-500/10 border border-red-500/30 text-red-400 px-2 py-0.5 rounded-full flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400"></span>
            Unavailable
          </span>
        );
    }
  };

  if (!state.profile) return null;

  return (
    <div
      className="glass-panel rounded-3xl p-6 relative hover:border-white/20 transition-all duration-300 overflow-hidden ai-lens-card-pulse"
      aria-busy={isLoading}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 0 1px rgba(0,255,135,0.3), 0 0 12px rgba(0,255,135,0.1); }
          50%       { box-shadow: 0 0 0 1px rgba(0,255,135,0.8), 0 0 24px rgba(0,255,135,0.3); }
        }
        .ai-lens-card-pulse {
          animation: pulse-border 2.5s ease-in-out infinite;
        }
      `}} />

      {/* Top Banner */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="font-display font-bold text-sm text-frost flex items-center gap-1.5">
            🤖 CarbonLens AI
          </span>
          {getStatusIndicator()}
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={isLoading || countdown > 0}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-display text-[11px] font-semibold transition-all duration-200 border border-border ${
            countdown > 0 || isLoading
              ? 'text-muted cursor-not-allowed bg-white/5'
              : 'text-green hover:bg-green/10 hover:border-green/20'
          }`}
          aria-label="Refresh AI Insights"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          {countdown > 0 ? `Retry in ${formatTime(countdown)}` : 'Analyze Footprint'}
        </button>
      </div>

      {/* Main Content Area */}
      {isLoading && !insight ? (
        <div className="space-y-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ) : insight ? (
        <div className="space-y-5" role="region" aria-label="AI Analysis Summary">
          {/* Observation (Typewritten) */}
          <div className="space-y-1">
            <h4 className="text-[10px] text-muted uppercase tracking-wider font-semibold font-data">
              Observation
            </h4>
            <p className="font-body text-xs md:text-sm text-frost leading-relaxed min-h-[40px]">
              {displayedObservation || insight.observation}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Actionable Tip */}
            <div className="space-y-1">
              <h4 className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold font-data flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Recommended Action
              </h4>
              <p className="font-body text-xs text-muted leading-relaxed">
                {insight.tip}
              </p>
            </div>

            {/* Motivation Nudge */}
            <div className="space-y-1">
              <h4 className="text-[10px] text-green uppercase tracking-wider font-semibold font-data">
                Climate Impact
              </h4>
              <p className="font-body text-xs text-muted leading-relaxed">
                {insight.nudge}
              </p>
            </div>
          </div>

          {/* Badge Footer */}
          {insight.saved_potential_kg > 0 && (
            <div className="flex justify-end pt-2 border-t border-border/50">
              <span className="font-data text-[10px] bg-green/10 text-[#00FF87] border border-[#00FF87]/30 px-3 py-1 rounded-full font-bold">
                Potential Saving: {insight.saved_potential_kg} kg/month 🌍
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6 text-xs text-muted font-body">
          {error ? (
            <p className="text-red-400 flex items-center justify-center gap-1">
              <AlertCircle className="h-4 w-4" /> {error}
            </p>
          ) : (
            <p>Click &apos;Analyze Footprint&apos; to trigger CarbonLens AI review.</p>
          )}
        </div>
      )}
    </div>
  );
}
