/**
 * @file calculations.ts
 * @description Helper functions for calculating carbon emissions across various categories.
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

/**
 * Clamps input value to a specified minimum and maximum range.
 * @param value - The numeric value to validate and clamp
 * @param min - The minimum allowable value
 * @param max - The maximum allowable value
 * @returns The clamped numeric value
 */
export function validateInput(value: number, min: number, max: number): number {
  if (isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculates the baseline carbon footprint in kg CO2/year from onboarding data.
 * @param profile - The user's onboarding profile answers
 * @returns The total calculated annual baseline carbon footprint in kg CO2
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
 * @param vehicleType - The type of transport vehicle used
 * @param distance - The distance traveled in kilometers
 * @returns The calculated CO2 emissions in kg CO2
 */
export function calculateTransportEmission(vehicleType: string, distance: number): number {
  // Clamp to realistic daily distance limit to prevent data entry errors from skewing stats
  const clampedDistance = validateInput(distance, 0, 2000);
  const factor = TRANSPORT_FACTORS[vehicleType] ?? TRANSPORT_FACTORS['Petrol car'];
  return Number((clampedDistance * factor).toFixed(2));
}

/**
 * Calculates emissions for a single Food log entry.
 * @param mealType - The type of food or meal consumed
 * @param servings - The number of servings consumed
 * @returns The calculated CO2 emissions in kg CO2
 */
export function calculateFoodEmission(mealType: string, servings: number): number {
  // Clamp servings to realistic meal portion sizes to avoid accidental high values
  const clampedServings = validateInput(servings, 1, 4);
  const factor = FOOD_FACTORS[mealType] ?? FOOD_FACTORS['Rice meal'];
  return Number((clampedServings * factor).toFixed(2));
}

/**
 * Calculates emissions for a single Energy log entry.
 * @param electricityKwh - The electricity consumed in kWh
 * @param state - The Indian state for grid factor lookup
 * @param lpgCylinders - The number of LPG cylinders consumed
 * @param generatorHours - The generator operating hours
 * @param generatorFuel - The type of fuel used in the generator
 * @returns The calculated CO2 emissions in kg CO2
 */
export function calculateEnergyEmission(
  electricityKwh: number,
  state: string,
  lpgCylinders: number,
  generatorHours: number,
  generatorFuel: string
): number {
  // Clamp values to realistic household monthly limits to prevent extreme data anomalies
  const clampedElectricity = validateInput(electricityKwh, 0, 10000);
  const clampedCylinders = validateInput(lpgCylinders, 0, 100);
  const clampedGenHours = validateInput(generatorHours, 0, 240);

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
 * @param shoppingCategory - The category of purchase
 * @param spend - The amount spent in Indian Rupees (INR)
 * @param isSecondHand - Whether the purchased item is second-hand
 * @returns The calculated CO2 emissions in kg CO2
 */
export function calculateShoppingEmission(
  shoppingCategory: string,
  spend: number,
  isSecondHand: boolean
): number {
  // Clamp transaction spend to handle normal shopping ranges and limit outlier impact
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
 * @param fromCity - The origin Indian city
 * @param toCity - The destination Indian city
 * @param travelClass - The cabin class of the flight
 * @param isReturn - Whether it is a round-trip flight
 * @returns The calculated CO2 emissions in kg CO2
 */
export function calculateTravelEmission(
  fromCity: string,
  toCity: string,
  travelClass: string,
  isReturn: boolean
): number {
  // Retrieve the distance between the two cities from the local database
  const distance = getCityDistance(fromCity, toCity);
  const totalDistance = isReturn ? distance * 2 : distance;
  const classMultiplier = FLIGHT_CLASS_MULTIPLIERS[travelClass] ?? 1.0;
  
  return Number((totalDistance * FLIGHT_BASE_FACTOR * classMultiplier).toFixed(2));
}
