/**
 * @file calculations.ts
 * @description Core calculation engine for translating user activities (transport, diet, energy, shopping, flight travel) into CO2 emission estimates.
 *
 * @module Calculations
 * @author CarbonLens Team
 */

import {
  TRANSPORT_FACTORS,
  FOOD_FACTORS,
  GRID_STATE_FACTORS,
  LPG_FACTOR,
  GENERATOR_FUEL_FACTORS,
  SHOPPING_FACTORS,
  SECOND_HAND_MULTIPLIER,
  FLIGHT_BASE_FACTOR,
  FLIGHT_CLASS_MULTIPLIERS,
} from './emissionFactors';
import { getCityDistance } from './cityDistances';
import { MAX_DISTANCE_KM, MAX_KWH_MONTH } from './constants';

/**
 * Clamps input value to a specified minimum and maximum range.
 * @param value - The raw input number to validate
 * @param min - The minimum allowed boundary
 * @param max - The maximum allowed boundary
 * @returns The clamped numeric value
 * @example
 * const clamped = validateInput(2500, 0, 2000);
 * // clamped: 2000
 */
export function validateInput(value: number, min: number, max: number): number {
  if (isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculates the baseline carbon footprint in kg CO2/year from onboarding data.
 * @param profile - Object containing transport, diet, energy, flights, and shopping preferences
 * @param profile.transport - Primary transport mode
 * @param profile.diet - Dietary preference
 * @param profile.energy - Home energy type
 * @param profile.flights - Flight frequency category
 * @param profile.shopping - Shopping habits category
 * @returns Annual baseline emissions in kg CO2
 */
export function calculateAnnualBaseline(profile: {
  transport: string;
  diet: string;
  energy: string;
  flights: string;
  shopping: string;
}): number {
  let transportCo2 = 0;
  switch (profile.transport) {
    case 'Petrol Car':
      transportCo2 = 2100;
      break;
    case 'Diesel Car':
      transportCo2 = 2700;
      break;
    case 'Two-wheeler':
      transportCo2 = 900;
      break;
    case 'Public Transit':
      transportCo2 = 320;
      break;
    case 'Walk/Cycle':
      transportCo2 = 0;
      break;
    case 'EV':
      transportCo2 = 400;
      break;
    default:
      transportCo2 = 1000;
  }

  let dietCo2 = 0;
  switch (profile.diet) {
    case 'Heavy meat (daily)':
      dietCo2 = 2500;
      break;
    case 'Mixed (meat 3–4x/week)':
      dietCo2 = 1500;
      break;
    case 'Vegetarian':
      dietCo2 = 900;
      break;
    case 'Vegan':
      dietCo2 = 500;
      break;
    default:
      dietCo2 = 1200;
  }

  let energyCo2 = 0;
  switch (profile.energy) {
    case 'Grid only':
      energyCo2 = 984;
      break;
    case 'Solar + Grid':
      energyCo2 = 492;
      break;
    case 'Fully renewable':
      energyCo2 = 120;
      break;
    case 'LPG/Kerosene heavy use':
      energyCo2 = 1200;
      break;
    default:
      energyCo2 = 800;
  }

  let flightsCo2 = 0;
  switch (profile.flights) {
    case 'None':
      flightsCo2 = 0;
      break;
    case '1–2 flights':
      flightsCo2 = 500;
      break;
    case '3–5 flights':
      flightsCo2 = 1400;
      break;
    case '6+ flights':
      flightsCo2 = 3000;
      break;
    default:
      flightsCo2 = 500;
  }

  let shoppingCo2 = 0;
  switch (profile.shopping) {
    case 'Minimal':
      shoppingCo2 = 200;
      break;
    case 'Moderate':
      shoppingCo2 = 600;
      break;
    case 'Frequent':
      shoppingCo2 = 1200;
      break;
    case 'Very frequent (weekly online orders)':
      shoppingCo2 = 2000;
      break;
    default:
      shoppingCo2 = 800;
  }

  return transportCo2 + dietCo2 + energyCo2 + flightsCo2 + shoppingCo2;
}

/**
 * Calculates emissions for a single Transport log entry.
 * @param vehicleType - Type of vehicle used (e.g. "Petrol car", "EV")
 * @param distance - Distance travelled in kilometers
 * @returns Total transport emissions in kg CO2
 */
export function calculateTransportEmission(vehicleType: string, distance: number): number {
  // Clamp distance to avoid unrealistic inputs skewing monthly totals
  const clampedDistance = validateInput(distance, 0, MAX_DISTANCE_KM);
  const factor = TRANSPORT_FACTORS[vehicleType] ?? TRANSPORT_FACTORS['Petrol car'];
  return Number((clampedDistance * factor).toFixed(2));
}

/**
 * Calculates emissions for a single Food log entry.
 * @param mealType - Category/type of the meal consumed
 * @param servings - Number of servings consumed
 * @returns Total food emissions in kg CO2
 */
export function calculateFoodEmission(mealType: string, servings: number): number {
  const clampedServings = validateInput(servings, 1, 4);
  const factor = FOOD_FACTORS[mealType] ?? FOOD_FACTORS['Rice meal'];
  return Number((clampedServings * factor).toFixed(2));
}

/**
 * Calculates emissions for a single Energy log entry.
 * @param electricityKwh - Electricity consumption in kWh
 * @param state - Indian state name for grid emission factor mapping
 * @param lpgCylinders - Number of LPG cylinders consumed
 * @param generatorHours - Runtime of diesel/petrol generator in hours
 * @param generatorFuel - Fuel type used in generator ("Petrol" or "Diesel")
 * @returns Total energy emissions in kg CO2
 */
export function calculateEnergyEmission(
  electricityKwh: number,
  state: string,
  lpgCylinders: number,
  generatorHours: number,
  generatorFuel: string
): number {
  const clampedElectricity = validateInput(electricityKwh, 0, MAX_KWH_MONTH);
  const clampedCylinders = validateInput(lpgCylinders, 0, 100);
  const clampedGenHours = validateInput(generatorHours, 0, 240);

  // Retrieve state-wise baseline emission factor
  const stateFactor = GRID_STATE_FACTORS[state] ?? GRID_STATE_FACTORS['Default'];
  const electricityCo2 = clampedElectricity * stateFactor;

  const lpgCo2 = clampedCylinders * LPG_FACTOR;

  const genFuelFactor = GENERATOR_FUEL_FACTORS[generatorFuel] ?? GENERATOR_FUEL_FACTORS['Petrol'];
  
  // Assuming a small household generator consumes roughly 1.5 liters of fuel per hour under normal load
  const fuelConsumedLiters = clampedGenHours * 1.5;
  const generatorCo2 = fuelConsumedLiters * genFuelFactor;

  return Number((electricityCo2 + lpgCo2 + generatorCo2).toFixed(2));
}

/**
 * Calculates emissions for a single Shopping log entry.
 * @param shoppingCategory - The category of purchase (clothing, electronics, etc.)
 * @param spend - Amount spent in Indian Rupees (INR)
 * @param isSecondHand - Whether the item purchased was pre-owned
 * @returns Total shopping emissions in kg CO2
 */
export function calculateShoppingEmission(
  shoppingCategory: string,
  spend: number,
  isSecondHand: boolean
): number {
  const clampedSpend = validateInput(spend, 0, 500000);
  const baseFactor = SHOPPING_FACTORS[shoppingCategory] ?? SHOPPING_FACTORS['Other'];
  let factor = baseFactor;
  if (isSecondHand) {
    factor = baseFactor * SECOND_HAND_MULTIPLIER;
  }
  return Number((clampedSpend * factor).toFixed(2));
}

/**
 * Calculates emissions for a single Travel (flight) log entry.
 * @param fromCity - Departure city airport/name
 * @param toCity - Arrival city airport/name
 * @param travelClass - Cabin class ("Economy", "Business", "First")
 * @param isReturn - Whether the flight is round-trip
 * @returns Total flight emissions in kg CO2
 */
export function calculateTravelEmission(
  fromCity: string,
  toCity: string,
  travelClass: string,
  isReturn: boolean
): number {
  const distance = getCityDistance(fromCity, toCity);
  const totalDistance = isReturn ? distance * 2 : distance;
  const classMultiplier = FLIGHT_CLASS_MULTIPLIERS[travelClass] ?? 1.0;
  
  return Number((totalDistance * FLIGHT_BASE_FACTOR * classMultiplier).toFixed(2));
}
