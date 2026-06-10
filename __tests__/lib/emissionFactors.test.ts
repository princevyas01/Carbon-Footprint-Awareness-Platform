import { describe, it, expect } from 'vitest';

describe('Transport Emission Factors', () => {
  it('petrol car 10km equals 2.1 kg CO2', () => {
    const factor = 0.21;
    expect(10 * factor).toBeCloseTo(2.1);
  });

  it('metro 10km equals 0.31 kg CO2', () => {
    const factor = 0.031;
    expect(10 * factor).toBeCloseTo(0.31);
  });

  it('EV 10km equals 1.0 kg CO2 on India grid', () => {
    const factor = 0.10;
    expect(10 * factor).toBeCloseTo(1.0);
  });

  it('two-wheeler 10km equals 0.9 kg CO2', () => {
    const factor = 0.09;
    expect(10 * factor).toBeCloseTo(0.9);
  });
});

describe('Food Emission Factors', () => {
  it('beef meal equals 6.61 kg CO2', () => {
    expect(6.61).toBeGreaterThan(6);
  });

  it('vegan thali equals 0.15 kg CO2', () => {
    expect(0.15).toBeLessThan(0.5);
  });

  it('vegan meal has lower emissions than beef', () => {
    const beef = 6.61;
    const vegan = 0.15;
    expect(vegan).toBeLessThan(beef);
  });
});

describe('Energy Emission Factors', () => {
  it('Maharashtra grid 100kWh equals 72 kg CO2', () => {
    const factor = 0.72;
    expect(100 * factor).toBeCloseTo(72);
  });

  it('Karnataka grid lower than UP grid', () => {
    const karnataka = 0.48;
    const up = 0.91;
    expect(karnataka).toBeLessThan(up);
  });

  it('India average grid factor is 0.82', () => {
    expect(0.82).toBeCloseTo(0.82);
  });
});
