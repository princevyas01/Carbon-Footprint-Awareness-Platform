/**
 * @file calculations.test.ts
 * @description Unit tests for carbon footprint calculation logic and validation constraints.
 *
 * @module Tests
 * @author CarbonLens Team
 */

import { describe, test, expect } from 'vitest';
import {
  calculateTransportEmission,
  calculateFoodEmission,
  calculateEnergyEmission,
  calculateShoppingEmission,
  calculateTravelEmission,
  calculateAnnualBaseline,
  validateInput,
} from '../lib/calculations';

describe('Carbon Calculations & Input Clamping', () => {
  test('validateInput normal values', () => {
    expect(validateInput(10, 0, 100)).toBe(10);
    expect(validateInput(-5, 0, 100)).toBe(0);
    expect(validateInput(150, 0, 100)).toBe(100);
  });

  test('calculateTransportEmission clamping and factors', () => {
    // Petrol Car factor = 0.21
    expect(calculateTransportEmission('Petrol car', 10)).toBe(2.10);
    // Diesel Car factor = 0.27
    expect(calculateTransportEmission('Diesel car', 20)).toBe(5.40);
    // Over the limit (clamped to 2000 km)
    expect(calculateTransportEmission('Petrol car', 3000)).toBe(420); // 2000 * 0.21 = 420
  });

  test('calculateFoodEmission factors', () => {
    // Beef curry factor = 6.61
    expect(calculateFoodEmission('Beef curry', 2)).toBe(13.22);
    // Vegan thali factor = 0.15
    expect(calculateFoodEmission('Vegan thali', 3)).toBe(0.45);
    // Roti+Sabzi factor = 0.22
    expect(calculateFoodEmission('Roti+Sabzi', 1)).toBe(0.22);
  });

  test('calculateFoodEmission fallback to default Rice meal', () => {
    // Unknown meal should fallback to 'Rice meal' (0.40)
    // 2 servings * 0.40 = 0.8
    expect(calculateFoodEmission('Nonexistent Meal', 2)).toBe(0.80);
  });

  test('calculateEnergyEmission calculations', () => {
    // Delhi grid factor = 0.82
    // Electricity: 100 kWh -> 100 * 0.82 = 82 kg
    // LPG: 1 cylinder -> 1 * 42.35 = 42.35 kg
    // Gen: 2 hours on Petrol -> 2 * 1.5 * 2.31 = 6.93 kg
    // Total = 82 + 42.35 + 6.93 = 131.28
    const result = calculateEnergyEmission(100, 'Delhi', 1, 2, 'Petrol');
    expect(result).toBeCloseTo(131.28, 2);

    // Karnataka grid factor = 0.48
    // Total = (150 * 0.48) + (2 * 42.35) = 72 + 84.7 = 156.7
    expect(calculateEnergyEmission(150, 'Karnataka', 2, 0, 'Diesel')).toBeCloseTo(156.7, 2);
  });

  test('calculateShoppingEmission retail vs second-hand', () => {
    // Clothing factor = 0.012 kg/₹
    // Retail spend 1000 -> 1000 * 0.012 = 12 kg
    expect(calculateShoppingEmission('Clothing', 1000, false)).toBe(12);
    // Second-hand spend 1000 -> 12 * 0.2 = 2.4 kg
    expect(calculateShoppingEmission('Clothing', 1000, true)).toBe(2.4);
  });

  test('calculateShoppingEmission fallback to default Other category', () => {
    // Unknown category should fallback to 'Other' (0.008)
    // Retail spend 1000 -> 1000 * 0.008 = 8 kg
    expect(calculateShoppingEmission('Novelties', 1000, false)).toBe(8);
  });

  test('calculateTravelEmission flight distance lookup and class multipliers', () => {
    // Mumbai (BOM) to Delhi (DEL) distance = 1148 km
    // Economy factor = 0.255 kg/km
    // One way Economy: 1148 * 0.255 = 292.74 kg
    expect(calculateTravelEmission('Mumbai', 'Delhi', 'Economy', false)).toBeCloseTo(292.74, 2);

    // Return trip Economy: 1148 * 2 * 0.255 = 585.48 kg
    expect(calculateTravelEmission('Mumbai', 'Delhi', 'Economy', true)).toBeCloseTo(585.48, 2);

    // One way Business: 1148 * 0.255 * 2.8 = 819.672 kg
    expect(calculateTravelEmission('Mumbai', 'Delhi', 'Business', false)).toBeCloseTo(819.672, 2);
  });

  test('calculateTravelEmission same city yields zero emissions', () => {
    // Distance from Mumbai to Mumbai = 0
    expect(calculateTravelEmission('Mumbai', 'Mumbai', 'Economy', false)).toBe(0);
  });

  test('calculateAnnualBaseline baseline calculator', () => {
    const answers = {
      transport: 'Petrol Car',
      diet: 'Mixed (meat 3–4x/week)',
      energy: 'Grid only',
      flights: '1–2 flights',
      shopping: 'Moderate',
    };
    const baseline = calculateAnnualBaseline(answers);
    expect(baseline).toBeGreaterThan(0);
  });
});
