/**
 * @file useAILens.ts
 * @description Custom hook for fetching, caching, and animating AI-generated carbon footprint insights.
 *
 * @module Hooks
 * @author CarbonLens Team
 */

import { useState, useEffect, useCallback } from 'react';
import { useCarbon } from '../context/CarbonContext';
import { useCarbonData } from './useCarbonData';
import { InsightResponse } from '../types';

/**
 * Custom hook to handle AI footprint analysis state, including loading, caching, rate limiting, and typewriter animation.
 * @returns An object containing insight, loading state, status, error, typewriter observation text, countdown, and trigger function.
 */
export function useAILens() {
  const { state } = useCarbon();
  const { categoryBreakdown, monthlyTotal, lastMonthTotal } = useCarbonData();

  const [insight, setInsight] = useState<InsightResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'loading' | 'live' | 'cached' | 'rate-limited' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  const [displayedObservation, setDisplayedObservation] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Cache key helper scoped per active user to support multiple profiles
  const getCacheKey = useCallback(() => {
    return state.activeUser ? `carbonlens_last_insight_${state.activeUser.id}` : 'carbonlens_last_insight';
  }, [state.activeUser]);

  const categories = Object.entries(categoryBreakdown) as [keyof typeof categoryBreakdown, number][];
  const topCategory = categories.length > 0
    ? categories.reduce((max, curr) => (curr[1] > max[1] ? curr : max), categories[0])[0]
    : 'transport';

  const monthDelta = lastMonthTotal > 0 ? Math.round(((monthlyTotal - lastMonthTotal) / lastMonthTotal) * 100) : 0;

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

  const fetchInsight = useCallback(async () => {
    setIsLoading(true);
    setStatus('loading');
    setError(null);

    try {
      const response = await fetch('/api/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyTotals: categoryBreakdown,
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
          try {
            setInsight(JSON.parse(cached));
            setStatus('cached');
          } catch {
            setStatus('rate-limited');
          }
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
        localStorage.setItem(
          getCacheKey(),
          JSON.stringify(data.insight)
        );
      } else {
        throw new Error('No insight in response');
      }

    } catch (err) {
      console.error('[useAILens.fetchInsight]:', err);
      const cached = localStorage.getItem(getCacheKey());
      if (cached) {
        try {
          setInsight(JSON.parse(cached));
          setStatus('cached');
        } catch {
          setStatus('error');
          setError(String(err));
        }
      } else {
        setStatus('error');
        setError(String(err));
      }
    } finally {
      setIsLoading(false);
    }
  }, [categoryBreakdown, profile, topCategory, monthDelta, ecoScore, level, getCacheKey]);

  // Auto-fetch on mount/profile switch
  useEffect(() => {
    if (state.profile) {
      fetchInsight();
    }
  }, [state.activeUser?.id, state.profile, fetchInsight]);

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

  return {
    insight,
    isLoading,
    status,
    error,
    displayedObservation,
    countdown,
    handleManualRefresh,
  };
}
