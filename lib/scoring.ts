import { Level } from '../types';

export const LEVEL_THRESHOLDS = {
  ROOKIE: { min: 0, max: 199, name: 'Carbon Rookie' as Level, icon: '🌑' },
  SPROUT: { min: 200, max: 399, name: 'Green Sprout' as Level, icon: '🌿' },
  WARRIOR: { min: 400, max: 599, name: 'Eco Warrior' as Level, icon: '🌊' },
  CHAMPION: { min: 600, max: 799, name: 'Solar Champion' as Level, icon: '☀️' },
  HERO: { min: 800, max: 1000, name: 'Carbon Zero Hero' as Level, icon: '🌍' },
};

export const SCORING_EVENTS = {
  ACTIVITY_LOGGED: 10,
  STREAK_MAINTAINED: 20, // logged yesterday + today
  CHALLENGE_COMPLETED: 50,
  STREAK_7_DAY: 100,
  BELOW_AVERAGE_MONTHLY: 200,
  NO_LOG_48H: -20,
};

/**
 * Returns level name, icon, and progress details based on score (0 - 1000).
 */
export function getLevelDetails(score: number): {
  level: Level;
  icon: string;
  minScore: number;
  maxScore: number;
  progressPercent: number; // percent towards next level
  pointsInCurrentLevel: number;
  pointsRequiredForNextLevel: number;
} {
  const clampedScore = Math.min(Math.max(score, 0), 1000);

  let details = LEVEL_THRESHOLDS.ROOKIE;
  if (clampedScore >= 800) {
    details = LEVEL_THRESHOLDS.HERO;
  } else if (clampedScore >= 600) {
    details = LEVEL_THRESHOLDS.CHAMPION;
  } else if (clampedScore >= 400) {
    details = LEVEL_THRESHOLDS.WARRIOR;
  } else if (clampedScore >= 200) {
    details = LEVEL_THRESHOLDS.SPROUT;
  }

  const range = details.max - details.min + 1;
  const pointsInCurrentLevel = clampedScore - details.min;
  const progressPercent = Math.min(Math.max((pointsInCurrentLevel / range) * 100, 0), 100);

  return {
    level: details.name,
    icon: details.icon,
    minScore: details.min,
    maxScore: details.max,
    progressPercent,
    pointsInCurrentLevel,
    pointsRequiredForNextLevel: range,
  };
}

/**
 * Detects if a score change triggers a level up.
 * Returns the new level name if a level up occurred, otherwise null.
 */
export function checkLevelUp(oldScore: number, newScore: number): Level | null {
  const oldLevel = getLevelDetails(oldScore).level;
  const newLevel = getLevelDetails(newScore).level;

  const levelOrder: Level[] = [
    'Carbon Rookie',
    'Green Sprout',
    'Eco Warrior',
    'Solar Champion',
    'Carbon Zero Hero',
  ];

  if (levelOrder.indexOf(newLevel) > levelOrder.indexOf(oldLevel)) {
    return newLevel;
  }
  return null;
}
