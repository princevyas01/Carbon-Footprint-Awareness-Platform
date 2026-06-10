import { useCarbon } from '../context/CarbonContext';

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
