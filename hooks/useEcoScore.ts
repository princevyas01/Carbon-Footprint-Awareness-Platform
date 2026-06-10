/**
 * @file useEcoScore.ts
 * @description Custom hook to retrieve current gamification score, level progression stats, and level-up events.
 *
 * @module Hooks
 * @author CarbonLens Team
 */

import { useCarbon } from '../context/CarbonContext';
import { getLevelDetails } from '../lib/scoring';

/**
 * Custom hook managing eco-score display variables and level-up modal signals.
 * @returns Object containing ecoScore, level progression details, levelUp modal event string, and dismiss function.
 * @example
 * const { score, levelDetails } = useEcoScore();
 */
export function useEcoScore() {
  const { state, dismissLevelUp } = useCarbon();

  const levelDetails = getLevelDetails(state.score);

  return {
    score: state.score,
    levelDetails,
    levelUpEvent: state.levelUpEvent,
    dismissLevelUp,
  };
}
