import { describe, test, expect } from 'vitest';
import { checkLevelUp, getLevelDetails } from '../lib/scoring';

describe('Gamification Scoring and Levels', () => {
  test('getLevelDetails score thresholds mapping', () => {
    // Rookie Level: 0 - 199
    const rookieLevel = getLevelDetails(50);
    expect(rookieLevel.level).toBe('Carbon Rookie');
    expect(rookieLevel.minScore).toBe(0);
    expect(rookieLevel.maxScore).toBe(199);
    expect(rookieLevel.progressPercent).toBeCloseTo(25, 1); // 50 / 200 = 25%

    // Sprout Level: 200 - 399
    const sproutLevel = getLevelDetails(250);
    expect(sproutLevel.level).toBe('Green Sprout');
    expect(sproutLevel.minScore).toBe(200);
    expect(sproutLevel.maxScore).toBe(399);

    // Hero Level: 800+
    const heroLevel = getLevelDetails(900);
    expect(heroLevel.level).toBe('Carbon Zero Hero');
  });

  test('checkLevelUp boundary triggers', () => {
    // No level change
    expect(checkLevelUp(50, 100)).toBeNull();
    expect(checkLevelUp(220, 350)).toBeNull();

    // Level up trigger across threshold (Rookie -> Sprout at 200)
    expect(checkLevelUp(190, 210)).toBe('Green Sprout');

    // Level up trigger across multiple thresholds (Rookie -> Warrior at 450)
    expect(checkLevelUp(100, 450)).toBe('Eco Warrior');
  });
});
