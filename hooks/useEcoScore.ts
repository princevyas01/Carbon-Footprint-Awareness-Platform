import { useCarbon } from '../context/CarbonContext';
import { getLevelDetails } from '../lib/scoring';

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
