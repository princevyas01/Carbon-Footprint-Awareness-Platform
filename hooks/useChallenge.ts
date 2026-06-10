/**
 * @file useChallenge.ts
 * @description Custom hook to manage sustainability challenge interactions, lists, filtering, and completion rewards.
 *
 * @module Hooks
 * @author CarbonLens Team
 */

import { useCarbon } from '../context/CarbonContext';

/**
 * Custom hook providing access to carbon challenge action dispatches and lists filtered by status.
 * @returns Object containing challenges, status-filtered subsets, and functions for starting, checking, completing, or dismissing challenges.
 * @example
 * const { activeChallenges, startChallenge } = useChallenge();
 */
export function useChallenge() {
  const { state, startChallenge, checkChallengeDay, abandonChallenge, completeChallenge, dismissCelebration } = useCarbon();

  return {
    challenges: state.challenges,
    activeChallenges: state.challenges.filter((c) => c.status === 'Active'),
    completedChallenges: state.challenges.filter((c) => c.status === 'Completed'),
    availableChallenges: state.challenges.filter((c) => c.status === 'Available'),
    celebrationChallenge: state.celebrationChallenge,
    startChallenge,
    checkChallengeDay,
    abandonChallenge,
    completeChallenge,
    dismissCelebration,
  };
}
