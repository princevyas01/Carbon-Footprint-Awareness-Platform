'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw, Sparkles, AlertCircle } from 'lucide-react';
import { useCarbon } from '../../context/CarbonContext';
import Skeleton from '../ui/Skeleton';

export default function AILensCard() {
  const { state, refreshAIInsight } = useCarbon();
  const { insight, isInsightLoading, insightError } = state;

  const [displayedObservation, setDisplayedObservation] = useState('');
  const [countdown, setCountdown] = useState(0);

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

  // Handle countdown for refresh debounce (5 mins)
  useEffect(() => {
    const checkCountdown = () => {
      const lastFetch = localStorage.getItem('carbonlens_last_insight_fetch');
      if (!lastFetch) {
        setCountdown(0);
        return;
      }
      const lastFetchMs = parseInt(lastFetch, 10);
      const elapsedSeconds = Math.floor((Date.now() - lastFetchMs) / 1000);
      const remaining = 300 - elapsedSeconds; // 5 minutes = 300 seconds
      setCountdown(remaining > 0 ? remaining : 0);
    };

    checkCountdown();
    const interval = setInterval(checkCountdown, 1000);

    return () => clearInterval(interval);
  }, [isInsightLoading]);

  const handleRefresh = async () => {
    if (countdown > 0) return;
    await refreshAIInsight(true); // pass true to override client check if needed, context enforces 5m check
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  // If no profile, don't show AI Lens Card yet
  if (!state.profile) return null;

  return (
    <div
      className="glass-panel rounded-3xl p-6 relative hover:border-white/20 transition-all duration-300 overflow-hidden ai-lens-card-pulse"
      aria-busy={isInsightLoading}
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
            <span className="relative flex h-[6px] w-[6px]">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-[6px] w-[6px] bg-green"></span>
            </span>
          </span>
          {insightError && (
            <span className="text-[10px] bg-amber/10 border border-amber/30 text-amber px-2 py-0.5 rounded-full flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Offline / Cached
            </span>
          )}
        </div>

        <button
          onClick={handleRefresh}
          disabled={isInsightLoading || countdown > 0}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-display text-[11px] font-semibold transition-all duration-200 border border-border ${
            countdown > 0 || isInsightLoading
              ? 'text-muted cursor-not-allowed bg-white/5'
              : 'text-green hover:bg-green/10 hover:border-green/20'
          }`}
          aria-label="Refresh AI Insights"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isInsightLoading ? 'animate-spin' : ''}`} />
          {countdown > 0 ? `Retry in ${formatTime(countdown)}` : 'Analyze Footprint'}
        </button>
      </div>

      {/* Main Content Area */}
      {isInsightLoading ? (
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
              {displayedObservation}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Actionable Tip */}
            <div className="space-y-1">
              <h4 className="text-[10px] text-amber uppercase tracking-wider font-semibold font-data flex items-center gap-1">
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
              <span className="font-data text-[10px] bg-green/10 text-green border border-green/30 px-3 py-1 rounded-full font-bold">
                Potential Saving: {insight.saved_potential_kg} kg/month 🌍
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6 text-xs text-muted font-body">
          <p className="mb-3">Click &apos;Analyze Footprint&apos; to trigger CarbonLens AI review.</p>
        </div>
      )}
    </div>
  );
}
