/**
 * CarbonLens Emission Factors
 * Values are in kg CO2 equivalent.
 */

// Transport emission factors per km (Source: EPA / India specific transport studies / IEA Transport Data)
export const TRANSPORT_FACTORS: Record<string, number> = {
  'Petrol car': 0.21,
  'Diesel car': 0.27,
  'CNG': 0.17,
  'Two-wheeler': 0.09,
  'EV': 0.10, // India specific average grid charging factor
  'Bus': 0.089, // Per passenger km average
  'Metro': 0.031, // Eco-friendly electric mass transit (Source: IEA / Delhi Metro DMRC)
  'Auto': 0.11, // Three-wheeler (LPG/CNG/Diesel mixed)
  'Train': 0.041, // Electric/Diesel national average
};

// Food emission factors per serving (Source: Poore & Nemecek, Science 2018 / Indian specific dietary footprint studies)
export const FOOD_FACTORS: Record<string, number> = {
  'Beef curry': 6.61, // High impact beef production lifecycle
  'Mutton/Lamb': 5.84, // Ruminant meat high methane
  'Pork': 2.15,
  'Chicken': 1.26, // Poultry lifecycle
  'Fish/Seafood': 0.87,
  'Eggs': 0.60,
  'Paneer/Dairy': 0.94, // High milk consumption footprint in India
  'Rice meal': 0.40, // Methane from flooded paddy fields
  'Dal': 0.24, // Low footprint legumes
  'Vegan thali': 0.15, // Lowest footprint
  'Idli/Dosa': 0.18, // Fermented rice and lentils
  'Roti+Sabzi': 0.22, // Wheat and mixed vegetables
};

// State-wise Electricity Grid Emission Factors (kg CO2 / kWh)
// Source: Central Electricity Authority (CEA) CO2 Baseline Database for the Indian Power Sector, 2023
export const GRID_STATE_FACTORS: Record<string, number> = {
  'Delhi': 0.82,
  'Maharashtra': 0.72,
  'Tamil Nadu': 0.54,
  'Karnataka': 0.48,
  'Gujarat': 0.88,
  'Uttar Pradesh': 0.91, // UP
  'Rajasthan': 0.85,
  'West Bengal': 0.89,
  'Madhya Pradesh': 0.87, // MP
  'Andhra Pradesh': 0.68, // AP
  'Telangana': 0.70,
  'Kerala': 0.42,
  'Punjab': 0.69,
  'Haryana': 0.83,
  'Default': 0.82, // Default average factor if state is unknown/unspecified
};

// LPG cylinder emission factor (Source: IPCC guidelines for national greenhouse gas inventories)
// 14.2kg standard cylinder * 2.983 kg CO2/kg LPG = 42.3586 kg CO2
export const LPG_FACTOR = 42.35; 

// Generator fuel emission factors per Liter (Source: EPA greenhouse gas reporting standards)
export const GENERATOR_FUEL_FACTORS: Record<string, number> = {
  'Petrol': 2.31,
  'Diesel': 2.68,
};

// Spend-based shopping emission intensity (kg CO2 per ₹ Spent)
// Source: Environmentally Extended Input-Output (EEIO) models adapted for Indian market prices
export const SHOPPING_FACTORS: Record<string, number> = {
  'Clothing': 0.012,
  'Electronics': 0.022,
  'Groceries': 0.005,
  'Personal care': 0.008,
  'Other': 0.008,
};

// Second-hand or refurbished items multiplier
export const SECOND_HAND_MULTIPLIER = 0.2;

// Air travel factors (Source: ICAO Carbon Emissions Calculator / DEFRA)
export const FLIGHT_BASE_FACTOR = 0.255; // kg CO2 / passenger km (Economy class)

export const FLIGHT_CLASS_MULTIPLIERS: Record<string, number> = {
  'Economy': 1.0,
  'Business': 2.8,
  'First': 4.0,
};
