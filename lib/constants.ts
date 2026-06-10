/**
 * @file constants.ts
 * @description Centralized application constants including thresholds, localStorage keys, and eco-score levels.
 *
 * @module Constants
 * @author CarbonLens Team
 */

/** Maximum realistic distance input in km */
export const MAX_DISTANCE_KM = 2000;

/** Maximum realistic monthly electricity in kWh */
export const MAX_KWH_MONTH = 10000;

/** India average monthly CO2 in kg (World Bank 2022) */
export const INDIA_MONTHLY_AVG_KG = 158;

/** India average annual CO2 in kg (World Bank 2022) */
export const INDIA_ANNUAL_AVG_KG = 1900;

/** Rate limit window for AI API calls in milliseconds */
export const AI_RATE_LIMIT_MS = 5 * 60 * 1000;

/** localStorage key names — never hardcode these inline */
export const STORAGE_KEYS = {
  USERS: 'appname_users',
  ACTIVE_USER: 'appname_active_user',
  THEME: 'appname_theme',
  LAST_INSIGHT: 'appname_last_insight',
  ONBOARDED: 'appname_onboarded',
} as const;

/** Eco score boundaries for each level */
export const LEVEL_THRESHOLDS = {
  ROOKIE: 0,
  SPROUT: 200,
  WARRIOR: 400,
  CHAMPION: 600,
  HERO: 800,
} as const;
