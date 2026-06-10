/** Represents the different carbon footprint categories */
export type Category = 'transport' | 'food' | 'energy' | 'shopping' | 'travel';

/** User's baseline configuration and onboarding status */
export interface UserProfile {
  transport: string;
  diet: string;
  energy: string;
  flights: string;
  shopping: string;
  baselineCo2: number; // kg/year
  isOnboarded: boolean;
}

/** A single logged activity entry with CO2 calculation */
export interface LogEntry {
  id: string;
  category: Category;
  date: string;
  description: string;
  co2: number; // kg CO2
  details: {
    // Transport details
    vehicleType?: string;
    distance?: number;
    // Food details
    mealSlot?: string;
    mealType?: string;
    servings?: number;
    // Energy details
    electricityKwh?: number;
    state?: string;
    lpgCylinders?: number;
    generatorHours?: number;
    generatorFuel?: string;
    // Shopping details
    shoppingCategory?: string;
    spend?: number;
    isSecondHand?: boolean;
    // Travel details
    fromCity?: string;
    toCity?: string;
    travelClass?: string;
    isReturn?: boolean;
  };
}

/** Difficulty levels for challenges */
export type ChallengeDifficulty = 'Easy' | 'Medium' | 'Hard';
/** Current progress status of a challenge */
export type ChallengeStatus = 'Available' | 'Active' | 'Completed';

/** A sustainability challenge that users can track and complete */
export interface Challenge {
  id: string;
  name: string;
  emoji: string;
  duration: string; // e.g. "5 days"
  durationDays: number;
  co2SavedPotential: number; // kg
  difficulty: ChallengeDifficulty;
  description: string;
  status: ChallengeStatus;
  startDate?: string;
  checkedDays?: string[]; // Array of ISO dates (YYYY-MM-DD)
  streak?: number;
}

/** A user notification banner or alert */
export interface Notification {
  id: string;
  icon: string;
  text: string;
  timestamp: number; // epoch ms
  read: boolean;
}

/** A tier title representing the user's progress in eco-consciousness */
export type Level =
  | 'Carbon Rookie'
  | 'Green Sprout'
  | 'Eco Warrior'
  | 'Solar Champion'
  | 'Carbon Zero Hero';

/** Response shape from the Gemini AI insight endpoint */
export interface InsightResponse {
  observation: string;
  tip: string;
  nudge: string;
  saved_potential_kg: number;
}

/** Summarized monthly performance and challenge metrics */
export interface MonthlyStats {
  month: string;
  totalCo2: number;
  bestCategory: string;
  worstCategory: string;
  challengesDone: number;
}

/** Monthly CO2 totals broken down by category in kg */
export interface CategoryBreakdown {
  transport: number;
  food: number;
  energy: number;
  shopping: number;
  travel: number;
}

/** A data point used to plot CO2 consumption on a chart */
export interface ChartDataPoint {
  name: string;
  co2: number;
}

/** Visual theme selected by the user */
export type Theme = 'dark' | 'light';

/** Represents a single user's complete profile and data */
export interface User {
  id: string;
  name: string;
  city: string;
  avatar: string;
  createdAt: string;
  lastActive: string;
  onboarded: boolean;
  profile: UserProfile | null;
  logs: LogEntry[];
  challenges: Challenge[];
  ecoScore: number;
  level: string;
  notifications: Notification[];
  theme: Theme;
  monthlyData?: Record<string, any>;
}

