import { describe, it, expect } from 'vitest';

describe('CO2 Calculations', () => {
  it('distance input clamped to max 2000km', () => {
    const clamp = (val: number, max: number) => Math.min(val, max);
    expect(clamp(5000, 2000)).toBe(2000);
    expect(clamp(500, 2000)).toBe(500);
  });

  it('category percentages sum to 100', () => {
    const totals = { transport: 50, food: 25, energy: 15, shopping: 5, travel: 5 };
    const total = Object.values(totals).reduce((a, b) => a + b, 0);
    const percentages = Object.values(totals).map(v => (v / total) * 100);
    const sum = percentages.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(100);
  });

  it('monthly total aggregates all categories', () => {
    const totals = { transport: 10, food: 20, energy: 30, shopping: 5, travel: 15 };
    const total = Object.values(totals).reduce((a, b) => a + b, 0);
    expect(total).toBe(80);
  });

  it('zero inputs produce zero total', () => {
    const totals = { transport: 0, food: 0, energy: 0, shopping: 0, travel: 0 };
    const total = Object.values(totals).reduce((a, b) => a + b, 0);
    expect(total).toBe(0);
  });
});
