/**
 * @file scoring.ts
 * @description In-app gamification engine defining eco-score levels, points metrics for logging events, and level progression logic.
 *
 * @module Gamification
 * @author CarbonLens Team
 */

import { Level } from '../types';
import { LEVEL_THRESHOLDS as BASE_THRESHOLDS } from './constants';

export const LEVEL_THRESHOLDS = {
  ROOKIE: { min: BASE_THRESHOLDS.ROOKIE, max: BASE_THRESHOLDS.SPROUT - 1, name: 'Carbon Rookie' as Level, icon: '🌑' },
  SPROUT: { min: BASE_THRESHOLDS.SPROUT, max: BASE_THRESHOLDS.WARRIOR - 1, name: 'Green Sprout' as Level, icon: '🌿' },
  WARRIOR: { min: BASE_THRESHOLDS.WARRIOR, max: BASE_THRESHOLDS.CHAMPION - 1, name: 'Eco Warrior' as Level, icon: '🌊' },
  CHAMPION: { min: BASE_THRESHOLDS.CHAMPION, max: BASE_THRESHOLDS.HERO - 1, name: 'Solar Champion' as Level, icon: '☀️' },
  HERO: { min: BASE_THRESHOLDS.HERO, max: 1000, name: 'Carbon Zero Hero' as Level, icon: '🌍' },
};

export const SCORING_EVENTS = {
  ACTIVITY_LOGGED: 10,
  STREAK_MAINTAINED: 20, // logged yesterday + today
  CHALLENGE_COMPLETED: 50,
  STREAK_7_DAY: 100,
  BELOW_AVERAGE_MONTHLY: 200,
  NO_LOG_48H: -20,
};

interface LevelDetail {
  min: number;
  max: number;
  name: Level;
  icon: string;
}

/**
 * Returns level name, icon, and progress details based on score (0 - 1000).
 * @param score - The user's current gamification score
 * @returns Object describing the level name, icon, score range, progress percentage, and requirements for next tier.
 * @example
 * const levelInfo = getLevelDetails(250);
 * // levelInfo: { level: 'Green Sprout', icon: '🌿', progressPercent: 25.5, ... }
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

  let details: LevelDetail = LEVEL_THRESHOLDS.ROOKIE;
  if (clampedScore >= BASE_THRESHOLDS.HERO) {
    details = LEVEL_THRESHOLDS.HERO;
  } else if (clampedScore >= BASE_THRESHOLDS.CHAMPION) {
    details = LEVEL_THRESHOLDS.CHAMPION;
  } else if (clampedScore >= BASE_THRESHOLDS.WARRIOR) {
    details = LEVEL_THRESHOLDS.WARRIOR;
  } else if (clampedScore >= BASE_THRESHOLDS.SPROUT) {
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
 * @param oldScore - Previous score before points were added/deducted
 * @param newScore - New score after update
 * @returns The new level name if user leveled up, or null
 * @example
 * const levelUp = checkLevelUp(190, 210);
 * // levelUp: 'Green Sprout'
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
