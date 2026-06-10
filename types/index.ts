export type Category = 'transport' | 'food' | 'energy' | 'shopping' | 'travel';

export interface UserProfile {
  transport: string;
  diet: string;
  energy: string;
  flights: string;
  shopping: string;
  baselineCo2: number; // kg/year
  isOnboarded: boolean;
}

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

export type ChallengeDifficulty = 'Easy' | 'Medium' | 'Hard';
export type ChallengeStatus = 'Available' | 'Active' | 'Completed';

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

export interface Notification {
  id: string;
  icon: string;
  text: string;
  timestamp: number; // epoch ms
  read: boolean;
}

export type Level =
  | 'Carbon Rookie'
  | 'Green Sprout'
  | 'Eco Warrior'
  | 'Solar Champion'
  | 'Carbon Zero Hero';

export interface InsightResponse {
  observation: string;
  tip: string;
  nudge: string;
  saved_potential_kg: number;
}

export interface MonthlyStats {
  month: string;
  totalCo2: number;
  bestCategory: string;
  worstCategory: string;
  challengesDone: number;
}

export interface CategoryBreakdown {
  transport: number;
  food: number;
  energy: number;
  shopping: number;
  travel: number;
}

export interface ChartDataPoint {
  name: string;
  co2: number;
}

export type Theme = 'dark' | 'light';

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

