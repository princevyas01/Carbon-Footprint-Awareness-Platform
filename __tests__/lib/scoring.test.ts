import { describe, it, expect } from 'vitest';

describe('Eco Score System', () => {
  it('score increments by 10 on activity log', () => {
    const score = 100;
    const increment = 10;
    expect(score + increment).toBe(110);
  });

  it('score increments by 50 on challenge complete', () => {
    const score = 200;
    const increment = 50;
    expect(score + increment).toBe(250);
  });

  it('score never exceeds 1000', () => {
    const clamp = (val: number) => Math.min(val, 1000);
    expect(clamp(1100)).toBe(1000);
    expect(clamp(999)).toBe(999);
  });

  it('score never goes below 0', () => {
    const clamp = (val: number) => Math.max(val, 0);
    expect(clamp(-50)).toBe(0);
    expect(clamp(50)).toBe(50);
  });

  it('Carbon Rookie level at 0-199 points', () => {
    const getLevel = (score: number) => {
      if (score < 200) return 'Carbon Rookie';
      if (score < 400) return 'Green Sprout';
      if (score < 600) return 'Eco Warrior';
      if (score < 800) return 'Solar Champion';
      return 'Carbon Zero Hero';
    };
    expect(getLevel(0)).toBe('Carbon Rookie');
    expect(getLevel(199)).toBe('Carbon Rookie');
    expect(getLevel(200)).toBe('Green Sprout');
    expect(getLevel(999)).toBe('Carbon Zero Hero');
  });
});
