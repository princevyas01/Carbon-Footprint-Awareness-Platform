'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  UserProfile,
  LogEntry,
  Challenge,
  Notification,
  Theme,
  InsightResponse,
  Level,
} from '../types';
import { storage } from '../lib/storage';
import { checkLevelUp, getLevelDetails, SCORING_EVENTS } from '../lib/scoring';
import { checkAndGenerateNotifications } from '../lib/notifications';
import { applyTheme, getSystemThemePreference } from '../lib/theme';

export const DEFAULT_CHALLENGES: Challenge[] = [
  { id: 'metro-week', name: 'Metro Week', emoji: '🚌', duration: '5 days', durationDays: 5, co2SavedPotential: 8.4, difficulty: 'Easy', description: 'Use only public transit', status: 'Available' },
  { id: 'plant-based-5', name: 'Plant-based 5', emoji: '🌱', duration: '5 days', durationDays: 5, co2SavedPotential: 25.0, difficulty: 'Easy', description: 'No meat for 5 days', status: 'Available' },
  { id: 'lights-out-9pm', name: 'Lights Out 9PM', emoji: '💡', duration: '7 days', durationDays: 7, co2SavedPotential: 3.0, difficulty: 'Easy', description: 'No non-essential power 9pm–6am', status: 'Available' },
  { id: 'zero-new-buys', name: 'Zero New Buys', emoji: '🛍️', duration: '14 days', durationDays: 14, co2SavedPotential: 15.0, difficulty: 'Medium', description: 'Buy nothing new', status: 'Available' },
  { id: 'ground-pledge', name: 'Ground Pledge', emoji: '✈️', duration: '90 days', durationDays: 90, co2SavedPotential: 120.0, difficulty: 'Hard', description: 'No flights', status: 'Available' },
  { id: 'vegan-mondays', name: 'Vegan Mondays', emoji: '🥗', duration: '28 days', durationDays: 28, co2SavedPotential: 6.5, difficulty: 'Easy', description: 'Vegan every Monday', status: 'Available' },
  { id: 'cycle-commute', name: 'Cycle Commute', emoji: '🚴', duration: '14 days', durationDays: 14, co2SavedPotential: 4.0, difficulty: 'Medium', description: 'Cycle 3 days/week', status: 'Available' },
  { id: 'zero-waste-week', name: 'Zero Waste Week', emoji: '♻️', duration: '7 days', durationDays: 7, co2SavedPotential: 2.0, difficulty: 'Medium', description: 'No single-use plastic', status: 'Available' },
  { id: 'fan-over-ac', name: 'Fan over AC', emoji: '🏠', duration: '10 days', durationDays: 10, co2SavedPotential: 18.0, difficulty: 'Medium', description: 'No AC (India summer)', status: 'Available' },
  { id: 'local-only', name: 'Local Only', emoji: '🛒', duration: '7 days', durationDays: 7, co2SavedPotential: 5.0, difficulty: 'Easy', description: 'Buy only from local vendors', status: 'Available' },
  { id: 'no-online-orders', name: 'No Online Orders', emoji: '📦', duration: '14 days', durationDays: 14, co2SavedPotential: 10.0, difficulty: 'Medium', description: 'No e-commerce', status: 'Available' },
  { id: 'cold-shower-week', name: 'Cold Shower Week', emoji: '🌡️', duration: '7 days', durationDays: 7, co2SavedPotential: 2.0, difficulty: 'Easy', description: 'Cold showers only', status: 'Available' },
];

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
}

interface CarbonState {
  profile: UserProfile | null;
  logs: LogEntry[];
  challenges: Challenge[];
  score: number;
  notifications: Notification[];
  theme: Theme;
  insight: InsightResponse | null;
  isInsightLoading: boolean;
  insightError: string | null;
  levelUpEvent: Level | null;
  celebrationChallenge: Challenge | null;
  toasts: ToastMessage[];
}

type CarbonAction =
  | { type: 'INIT_STATE'; payload: Partial<CarbonState> }
  | { type: 'SET_PROFILE'; payload: UserProfile }
  | { type: 'ADD_LOG'; payload: { entry: LogEntry; pointsEarned: number } }
  | { type: 'DELETE_LOG'; payload: { id: string } }
  | { type: 'UPDATE_LOG'; payload: { entry: LogEntry } }
  | { type: 'START_CHALLENGE'; payload: { id: string; startDate: string } }
  | { type: 'CHECK_CHALLENGE_DAY'; payload: { id: string; date: string; checked: boolean } }
  | { type: 'ABANDON_CHALLENGE'; payload: { id: string } }
  | { type: 'COMPLETE_CHALLENGE'; payload: { id: string; pointsEarned: number } }
  | { type: 'APPLY_PENALTY'; payload: { penalty: number } }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: { id: string } }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_INSIGHT_LOADING'; payload: boolean }
  | { type: 'SET_INSIGHT_SUCCESS'; payload: InsightResponse }
  | { type: 'SET_INSIGHT_ERROR'; payload: string }
  | { type: 'DISMISS_LEVEL_UP' }
  | { type: 'DISMISS_CELEBRATION' }
  | { type: 'ADD_TOAST'; payload: ToastMessage }
  | { type: 'REMOVE_TOAST'; payload: string };

const initialState: CarbonState = {
  profile: null,
  logs: [],
  challenges: [],
  score: 0,
  notifications: [],
  theme: 'dark',
  insight: null,
  isInsightLoading: false,
  insightError: null,
  levelUpEvent: null,
  celebrationChallenge: null,
  toasts: [],
};

function carbonReducer(state: CarbonState, action: CarbonAction): CarbonState {
  switch (action.type) {
    case 'INIT_STATE':
      return { ...state, ...action.payload };

    case 'SET_PROFILE':
      return {
        ...state,
        profile: action.payload,
        challenges: state.challenges.length === 0 ? DEFAULT_CHALLENGES : state.challenges,
      };

    case 'ADD_LOG': {
      const newScore = Math.min(Math.max(state.score + action.payload.pointsEarned, 0), 1000);
      const levelUp = checkLevelUp(state.score, newScore);
      return {
        ...state,
        logs: [action.payload.entry, ...state.logs],
        score: newScore,
        levelUpEvent: levelUp || state.levelUpEvent,
      };
    }

    case 'DELETE_LOG':
      return {
        ...state,
        logs: state.logs.filter((log) => log.id !== action.payload.id),
      };

    case 'UPDATE_LOG':
      return {
        ...state,
        logs: state.logs.map((log) => (log.id === action.payload.entry.id ? action.payload.entry : log)),
      };

    case 'START_CHALLENGE':
      return {
        ...state,
        challenges: state.challenges.map((c) =>
          c.id === action.payload.id
            ? { ...c, status: 'Active', startDate: action.payload.startDate, checkedDays: [], streak: 0 }
            : c
        ),
      };

    case 'CHECK_CHALLENGE_DAY':
      return {
        ...state,
        challenges: state.challenges.map((c) => {
          if (c.id === action.payload.id) {
            const checkedDays = c.checkedDays || [];
            const newChecked = action.payload.checked
              ? [...checkedDays, action.payload.date]
              : checkedDays.filter((d) => d !== action.payload.date);
            return {
              ...c,
              checkedDays: newChecked,
              streak: action.payload.checked ? (c.streak || 0) + 1 : Math.max(0, (c.streak || 0) - 1),
            };
          }
          return c;
        }),
      };

    case 'ABANDON_CHALLENGE':
      return {
        ...state,
        challenges: state.challenges.map((c) =>
          c.id === action.payload.id
            ? { ...c, status: 'Available', startDate: undefined, checkedDays: undefined, streak: undefined }
            : c
        ),
      };

    case 'COMPLETE_CHALLENGE': {
      const newScore = Math.min(Math.max(state.score + action.payload.pointsEarned, 0), 1000);
      const levelUp = checkLevelUp(state.score, newScore);
      const challenge = state.challenges.find((c) => c.id === action.payload.id);
      return {
        ...state,
        challenges: state.challenges.map((c) =>
          c.id === action.payload.id ? { ...c, status: 'Completed' } : c
        ),
        score: newScore,
        levelUpEvent: levelUp || state.levelUpEvent,
        celebrationChallenge: challenge || null,
      };
    }

    case 'APPLY_PENALTY': {
      const newScore = Math.min(Math.max(state.score - action.payload.penalty, 0), 1000);
      return {
        ...state,
        score: newScore,
      };
    }

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications].slice(0, 50),
      };

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload.id ? { ...n, read: true } : n
        ),
      };

    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };

    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
      };

    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };

    case 'SET_INSIGHT_LOADING':
      return {
        ...state,
        isInsightLoading: action.payload,
        insightError: null,
      };

    case 'SET_INSIGHT_SUCCESS':
      return {
        ...state,
        insight: action.payload,
        isInsightLoading: false,
        insightError: null,
      };

    case 'SET_INSIGHT_ERROR':
      return {
        ...state,
        isInsightLoading: false,
        insightError: action.payload,
      };

    case 'DISMISS_LEVEL_UP':
      return {
        ...state,
        levelUpEvent: null,
      };

    case 'DISMISS_CELEBRATION':
      return {
        ...state,
        celebrationChallenge: null,
      };

    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, action.payload],
      };

    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload),
      };

    default:
      return state;
  }
}

interface CarbonContextProps {
  state: CarbonState;
  showToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  setProfile: (profile: UserProfile) => void;
  logActivity: (entry: Omit<LogEntry, 'id'>) => void;
  deleteActivity: (id: string) => void;
  updateActivity: (entry: LogEntry) => void;
  startChallenge: (id: string) => void;
  checkChallengeDay: (id: string, date: string, checked: boolean) => void;
  abandonChallenge: (id: string) => void;
  completeChallenge: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearAllNotifications: () => void;
  toggleTheme: () => void;
  refreshAIInsight: (force?: boolean) => Promise<void>;
  dismissLevelUp: () => void;
  dismissCelebration: () => void;
}

const CarbonContext = createContext<CarbonContextProps | undefined>(undefined);

export const CarbonProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(carbonReducer, initialState);

  // Helper: Toast
  const showToast = (message: string, type: ToastMessage['type'] = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    dispatch({ type: 'ADD_TOAST', payload: { id, type, message } });
    setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', payload: id });
    }, 4000);
  };

  const removeToast = (id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  };

  // 1. Load initial state once on mount from storage
  useEffect(() => {
    let onboarded = storage.getOnboarded();
    let profile = storage.getProfile();
    let logs = storage.getLogs();
    let challenges = storage.getChallenges();
    let score = storage.getScore();
    const notifications = storage.getNotifications();
    const theme = storage.getTheme() || getSystemThemePreference();
    const insight = storage.getLastInsight();

    // Seeding demo data on first load if no logs exist
    if (logs.length === 0) {
      profile = {
        transport: 'petrolCar',
        diet: 'mixed',
        energy: 'gridOnly',
        flights: '1-2',
        shopping: 'moderate',
        baselineCo2: 5200,
        isOnboarded: true,
      };
      storage.setProfile(profile);
      storage.setOnboarded(true);
      onboarded = true;

      const dayMs = 24 * 60 * 60 * 1000;
      const getRelDate = (daysAgo: number) => new Date(Date.now() - daysAgo * dayMs).toISOString().split('T')[0];

      logs = [
        // Week 1 (6 weeks ago -> 42 days ago)
        { id: 'seed-w1-1', category: 'transport', date: getRelDate(42), description: 'Petrol car - 45km commute', co2: 9.45, details: { vehicleType: 'Petrol car', distance: 45 } },
        { id: 'seed-w1-2', category: 'food', date: getRelDate(41), description: 'Chicken lunch', co2: 1.26, details: { mealSlot: 'Lunch', mealType: 'Chicken', servings: 1 } },
        { id: 'seed-w1-3', category: 'food', date: getRelDate(40), description: 'Mixed dinner', co2: 1.5, details: { mealSlot: 'Dinner', mealType: 'Mixed', servings: 1 } },
        { id: 'seed-w1-4', category: 'energy', date: getRelDate(39), description: '80 kWh electricity (Maharashtra)', co2: 57.6, details: { electricityKwh: 80, state: 'Maharashtra' } },

        // Week 2 (5 weeks ago -> 35 days ago)
        { id: 'seed-w2-1', category: 'transport', date: getRelDate(35), description: 'Metro - 12km commute', co2: 0.37, details: { vehicleType: 'Metro', distance: 12 } },
        { id: 'seed-w2-2', category: 'transport', date: getRelDate(34), description: 'Petrol car - 30km commute', co2: 6.3, details: { vehicleType: 'Petrol car', distance: 30 } },
        { id: 'seed-w2-3', category: 'food', date: getRelDate(33), description: 'Beef curry', co2: 6.61, details: { mealType: 'Beef curry', servings: 1 } },
        { id: 'seed-w2-4', category: 'food', date: getRelDate(32), description: 'Dal dinner', co2: 0.24, details: { mealType: 'Dal', servings: 1 } },
        { id: 'seed-w2-5', category: 'shopping', date: getRelDate(31), description: 'Clothing purchase', co2: 24, details: { shoppingCategory: 'Clothing', spend: 2000, isSecondHand: false } },

        // Week 3 (4 weeks ago -> 28 days ago)
        { id: 'seed-w3-1', category: 'transport', date: getRelDate(28), description: 'Two-wheeler - 25km commute', co2: 2.25, details: { vehicleType: 'Two-wheeler', distance: 25 } },
        { id: 'seed-w3-2', category: 'food', date: getRelDate(27), description: 'Vegan thali × 3', co2: 0.45, details: { mealType: 'Vegan thali', servings: 3 } },
        { id: 'seed-w3-3', category: 'food', date: getRelDate(26), description: 'Chicken × 2', co2: 2.52, details: { mealType: 'Chicken', servings: 2 } },
        { id: 'seed-w3-4', category: 'travel', date: getRelDate(25), description: 'Flight from Mumbai to Pune (Economy)', co2: 115, details: { fromCity: 'Mumbai', toCity: 'Pune', travelClass: 'Economy', isReturn: false } },

        // Week 4 (3 weeks ago -> 21 days ago)
        { id: 'seed-w4-1', category: 'transport', date: getRelDate(21), description: 'Bus - 20km commute', co2: 1.78, details: { vehicleType: 'Bus', distance: 20 } },
        { id: 'seed-w4-2', category: 'transport', date: getRelDate(20), description: 'Petrol car - 15km commute', co2: 3.15, details: { vehicleType: 'Petrol car', distance: 15 } },
        { id: 'seed-w4-3', category: 'food', date: getRelDate(19), description: 'Paneer × 2', co2: 1.88, details: { mealType: 'Paneer/Dairy', servings: 2 } },
        { id: 'seed-w4-4', category: 'food', date: getRelDate(18), description: 'Rice meal × 3', co2: 1.2, details: { mealType: 'Rice meal', servings: 3 } },
        { id: 'seed-w4-5', category: 'energy', date: getRelDate(17), description: 'LPG - 1 cylinder', co2: 42.35, details: { lpgCylinders: 1 } },

        // Week 5 (2 weeks ago -> 14 days ago)
        { id: 'seed-w5-1', category: 'transport', date: getRelDate(14), description: 'Metro - 8km commute', co2: 0.25, details: { vehicleType: 'Metro', distance: 8 } },
        { id: 'seed-w5-2', category: 'transport', date: getRelDate(13), description: 'Cycle - green transit', co2: 0, details: { vehicleType: 'Cycle', distance: 5 } },
        { id: 'seed-w5-3', category: 'food', date: getRelDate(12), description: 'Vegan thali × 5', co2: 0.75, details: { mealType: 'Vegan thali', servings: 5 } },
        { id: 'seed-w5-4', category: 'food', date: getRelDate(11), description: 'Eggs × 3', co2: 1.8, details: { mealType: 'Eggs', servings: 3 } },
        { id: 'seed-w5-5', category: 'shopping', date: getRelDate(10), description: 'Electronics purchase', co2: 110, details: { shoppingCategory: 'Electronics', spend: 5000, isSecondHand: false } },

        // Week 6 (this week / current month -> 2 days ago)
        { id: 'seed-w6-1', category: 'transport', date: getRelDate(2), description: 'Petrol car - 60km commute', co2: 12.6, details: { vehicleType: 'Petrol car', distance: 60 } },
        { id: 'seed-w6-2', category: 'food', date: getRelDate(1), description: 'Chicken × 4', co2: 5.04, details: { mealType: 'Chicken', servings: 4 } },
        { id: 'seed-w6-3', category: 'food', date: getRelDate(0), description: 'Dal × 3', co2: 0.72, details: { mealType: 'Dal', servings: 3 } },
        { id: 'seed-w6-4', category: 'energy', date: getRelDate(0), description: '95 kWh electricity (Maharashtra)', co2: 68.4, details: { electricityKwh: 95, state: 'Maharashtra' } },
      ];
      storage.setLogs(logs);

      score = 240;
      storage.setScore(score);

      const activeChall: Challenge = {
        id: 'metro-week',
        name: 'Metro Week',
        emoji: '🚌',
        duration: '5 days',
        durationDays: 5,
        co2SavedPotential: 8.4,
        difficulty: 'Easy',
        description: 'Use only public transit',
        status: 'Active',
        startDate: getRelDate(3),
        checkedDays: [getRelDate(3), getRelDate(2), getRelDate(1)],
        streak: 3,
      };

      challenges = DEFAULT_CHALLENGES.map((c) => (c.id === 'metro-week' ? activeChall : c));
      storage.setChallenges(challenges);
    }

    // Check if we need to apply inactivity penalty (-20 points if no log in 48+ hours)
    let finalScore = score;
    let newNotifications = [...notifications];
    if (onboarded && logs.length > 0) {
      const now = Date.now();
      const latestLog = logs.reduce((latest, current) => {
        return new Date(current.date).getTime() > new Date(latest.date).getTime() ? current : latest;
      });
      const lastLogMs = new Date(latestLog.date).getTime();
      const hoursSinceLastLog = (now - lastLogMs) / (1000 * 60 * 60);

      // We read last penalty applied timestamp to avoid double penalty for same gap
      const lastPenaltyApplied = typeof window !== 'undefined' ? localStorage.getItem('carbonlens_last_penalty_time') : null;
      const lastPenaltyMs = lastPenaltyApplied ? parseInt(lastPenaltyApplied, 10) : 0;

      if (hoursSinceLastLog >= 48 && lastPenaltyMs < lastLogMs) {
        finalScore = Math.max(score - 20, 0);
        
        // Save penalty timestamp
        if (typeof window !== 'undefined') {
          localStorage.setItem('carbonlens_last_penalty_time', String(now));
        }

        const penaltyNotif: Notification = {
          id: `penalty-${now}`,
          icon: '⚠️',
          text: 'Inactivity penalty applied: -20 points (no logs in 48h)',
          timestamp: now,
          read: false,
        };
        newNotifications = [penaltyNotif, ...newNotifications].slice(0, 50);
        
        // Dispatch penalty immediately so state is updated
        dispatch({ type: 'APPLY_PENALTY', payload: { penalty: 20 } });
        dispatch({ type: 'ADD_NOTIFICATION', payload: penaltyNotif });
        showToast('Inactivity penalty: -20 points ⚠️', 'warning');
      }
    }

    // Initialize state
    dispatch({
      type: 'INIT_STATE',
      payload: {
        profile,
        logs,
        challenges: challenges.length === 0 ? DEFAULT_CHALLENGES : challenges,
        score: finalScore,
        notifications: newNotifications,
        theme,
        insight,
      },
    });

    applyTheme(theme);
  }, []);

  // 2. Write states to storage when they change
  useEffect(() => {
    if (state.profile) {
      storage.setProfile(state.profile);
      storage.setOnboarded(true);
    }
  }, [state.profile]);

  useEffect(() => {
    storage.setLogs(state.logs);
  }, [state.logs]);

  useEffect(() => {
    if (state.challenges.length > 0) {
      storage.setChallenges(state.challenges);
    }
  }, [state.challenges]);

  useEffect(() => {
    storage.setScore(state.score);
  }, [state.score]);

  useEffect(() => {
    storage.setNotifications(state.notifications);
  }, [state.notifications]);

  useEffect(() => {
    storage.setTheme(state.theme);
    applyTheme(state.theme);
  }, [state.theme]);

  useEffect(() => {
    if (state.insight) {
      storage.setLastInsight(state.insight);
    }
  }, [state.insight]);

  // Actions
  const setProfile = (profile: UserProfile) => {
    dispatch({ type: 'SET_PROFILE', payload: profile });
    showToast('Onboarding completed! Welcome to CarbonLens 🌍');
  };

  const logActivity = (entryData: Omit<LogEntry, 'id'>) => {
    const entry: LogEntry = {
      ...entryData,
      id: Math.random().toString(36).substring(2, 9),
    };

    // Calculate score points earned
    let pointsEarned = SCORING_EVENTS.ACTIVITY_LOGGED; // +10
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Check yesterday log for daily streak (+20)
    const loggedYesterday = state.logs.some((l) => l.date === yesterdayStr);
    const loggedTodayAlready = state.logs.some((l) => l.date === todayStr);
    if (loggedYesterday && !loggedTodayAlready) {
      pointsEarned += SCORING_EVENTS.STREAK_MAINTAINED; // +20
      showToast('Daily log streak maintained! +20 points 🔥');
    }

    // Check 7-day logging streak (+100)
    // Verify if there's a log on each of the last 7 days (including today)
    let loggedLast7Days = true;
    for (let i = 1; i < 7; i++) {
      const checkDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      if (!state.logs.some((l) => l.date === checkDate)) {
        loggedLast7Days = false;
        break;
      }
    }
    // Only award once per day
    const alreadyAwarded7DayToday = state.notifications.some(
      (n) => n.id === `7-day-streak-${todayStr}`
    );
    if (loggedLast7Days && !loggedTodayAlready && !alreadyAwarded7DayToday) {
      pointsEarned += SCORING_EVENTS.STREAK_7_DAY; // +100
      const streakNotif: Notification = {
        id: `7-day-streak-${todayStr}`,
        icon: '🏆',
        text: "You've logged 7 days in a row! +100 points 🔥",
        timestamp: Date.now(),
        read: false,
      };
      dispatch({ type: 'ADD_NOTIFICATION', payload: streakNotif });
      showToast('7-day logging streak milestone! +100 points 🏆');
    }

    dispatch({ type: 'ADD_LOG', payload: { entry, pointsEarned } });
    showToast(`Logged activity: ${entry.description} (+${pointsEarned} XP)`);

    // Check and generate smart notifications
    const updatedLogs = [entry, ...state.logs];
    const newNotifs = checkAndGenerateNotifications(updatedLogs, state.challenges, state.notifications);
    // If new notifications were added, merge them in state
    if (newNotifs.length > state.notifications.length) {
      // Find what's new
      const currentIds = new Set(state.notifications.map((n) => n.id));
      newNotifs.forEach((n) => {
        if (!currentIds.has(n.id)) {
          dispatch({ type: 'ADD_NOTIFICATION', payload: n });
        }
      });
    }
  };

  const deleteActivity = (id: string) => {
    const entry = state.logs.find((l) => l.id === id);
    dispatch({ type: 'DELETE_LOG', payload: { id } });
    if (entry) {
      showToast(`Removed log: ${entry.description}`, 'info');
    }
  };

  const updateActivity = (entry: LogEntry) => {
    dispatch({ type: 'UPDATE_LOG', payload: { entry } });
    showToast(`Updated log: ${entry.description}`);
  };

  const startChallenge = (id: string) => {
    const startDate = new Date().toISOString().split('T')[0];
    dispatch({ type: 'START_CHALLENGE', payload: { id, startDate } });
    const challenge = state.challenges.find((c) => c.id === id);
    showToast(`Started challenge: ${challenge?.name || ''} 🎯`);
  };

  const checkChallengeDay = (id: string, date: string, checked: boolean) => {
    dispatch({ type: 'CHECK_CHALLENGE_DAY', payload: { id, date, checked } });
  };

  const abandonChallenge = (id: string) => {
    dispatch({ type: 'ABANDON_CHALLENGE', payload: { id } });
    const challenge = state.challenges.find((c) => c.id === id);
    showToast(`Abandoned challenge: ${challenge?.name || ''}`, 'warning');
  };

  const completeChallenge = (id: string) => {
    // Award +50 score points
    dispatch({ type: 'COMPLETE_CHALLENGE', payload: { id, pointsEarned: 50 } });
    const challenge = state.challenges.find((c) => c.id === id);
    
    // Add completion notification
    const completeNotif: Notification = {
      id: `challenge-complete-${id}-${Date.now()}`,
      icon: '🎉',
      text: `Challenge complete! You saved ${challenge?.co2SavedPotential || 0} kg CO₂ 🌍`,
      timestamp: Date.now(),
      read: false,
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: completeNotif });
    showToast(`Challenge completed! +50 XP 🎉`);
  };

  const markNotificationRead = (id: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: { id } });
  };

  const markAllNotificationsRead = () => {
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
    showToast('All notifications marked as read', 'info');
  };

  const clearAllNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
    showToast('Cleared all notifications', 'info');
  };

  const toggleTheme = () => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    dispatch({ type: 'SET_THEME', payload: newTheme });
  };

  const refreshAIInsight = async (force = false) => {
    if (!state.profile) return;

    // Client-side 5-minute debounce check
    const lastFetch = typeof window !== 'undefined' ? localStorage.getItem('carbonlens_last_insight_fetch') : null;
    const lastFetchMs = lastFetch ? parseInt(lastFetch, 10) : 0;
    const now = Date.now();
    const elapsedMinutes = (now - lastFetchMs) / (1000 * 60);

    if (!force && elapsedMinutes < 5 && state.insight) {
      showToast('AI insight is up to date (5m debounce)', 'info');
      return;
    }

    dispatch({ type: 'SET_INSIGHT_LOADING', payload: true });

    try {
      // Calculate monthly totals for request
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const currentMonthLogs = state.logs.filter((log) => {
        const logDate = new Date(log.date);
        return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
      });

      const monthlyTotals = {
        transport: currentMonthLogs.filter((l) => l.category === 'transport').reduce((sum, l) => sum + l.co2, 0),
        food: currentMonthLogs.filter((l) => l.category === 'food').reduce((sum, l) => sum + l.co2, 0),
        energy: currentMonthLogs.filter((l) => l.category === 'energy').reduce((sum, l) => sum + l.co2, 0),
        shopping: currentMonthLogs.filter((l) => l.category === 'shopping').reduce((sum, l) => sum + l.co2, 0),
        travel: currentMonthLogs.filter((l) => l.category === 'travel').reduce((sum, l) => sum + l.co2, 0),
      };

      // Determine top category
      const categories = Object.entries(monthlyTotals) as [keyof typeof monthlyTotals, number][];
      const topCategory = categories.reduce((max, curr) => (curr[1] > max[1] ? curr : max), categories[0])[0];

      // Calculate monthDelta (this month vs last month)
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const lastMonthLogs = state.logs.filter((log) => {
        const logDate = new Date(log.date);
        return logDate.getMonth() === lastMonth && logDate.getFullYear() === lastMonthYear;
      });

      const lastMonthTotal = lastMonthLogs.reduce((sum, l) => sum + l.co2, 0);
      const thisMonthTotal = currentMonthLogs.reduce((sum, l) => sum + l.co2, 0);
      const monthDelta = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

      const activeChallenges = state.challenges
        .filter((c) => c.status === 'Active')
        .map((c) => c.name);

      const levelDetails = getLevelDetails(state.score);

      const response = await fetch('/api/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyTotals,
          profile: {
            transport: state.profile.transport,
            diet: state.profile.diet,
            energy: state.profile.energy,
            flights: state.profile.flights,
            shopping: state.profile.shopping,
          },
          topCategory,
          monthDelta,
          activeChallenges,
          ecoScore: state.score,
          level: levelDetails.level,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const insightData: InsightResponse = await response.json();
      dispatch({ type: 'SET_INSIGHT_SUCCESS', payload: insightData });
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('carbonlens_last_insight_fetch', String(now));
      }
      showToast('CarbonLens AI insights updated! 🤖');
    } catch (e: any) {
      console.error('Failed to fetch Gemini insights:', e);
      // Fallback to cache
      const cached = storage.getLastInsight();
      if (cached) {
        dispatch({ type: 'SET_INSIGHT_SUCCESS', payload: cached });
        dispatch({ type: 'SET_INSIGHT_ERROR', payload: 'Fallback to cached insights due to network error.' });
        showToast('Offline: loaded cached AI insights', 'warning');
      } else {
        dispatch({ type: 'SET_INSIGHT_ERROR', payload: e.message || 'Unknown network error' });
        showToast('Failed to update AI insights. Please check connection.', 'error');
      }
    }
  };

  const dismissLevelUp = () => {
    dispatch({ type: 'DISMISS_LEVEL_UP' });
  };

  const dismissCelebration = () => {
    dispatch({ type: 'DISMISS_CELEBRATION' });
  };

  return (
    <CarbonContext.Provider
      value={{
        state,
        showToast,
        removeToast,
        setProfile,
        logActivity,
        deleteActivity,
        updateActivity,
        startChallenge,
        checkChallengeDay,
        abandonChallenge,
        completeChallenge,
        markNotificationRead,
        markAllNotificationsRead,
        clearAllNotifications,
        toggleTheme,
        refreshAIInsight,
        dismissLevelUp,
        dismissCelebration,
      }}
    >
      {children}
    </CarbonContext.Provider>
  );
};

export const useCarbon = () => {
  const context = useContext(CarbonContext);
  if (!context) {
    throw new Error('useCarbon must be used within a CarbonProvider');
  }
  return context;
};
