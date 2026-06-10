'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  User,
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
  activeUser: User | null;
  allUsers: User[];
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
  activeUser: null,
  allUsers: [],
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
      applyTheme(action.payload);
      if (typeof window !== 'undefined') {
        localStorage.setItem('carbonlens_theme', action.payload);
      }
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
  // Multi-user Handlers
  selectUser: (id: string) => void;
  createNewUser: (name: string, city: string, avatar: string) => void;
  deleteUserAccount: (id: string) => void;
  resetActiveUserData: () => void;
  updateActiveUserMetadata: (name: string, city: string, avatar: string) => void;
  switchUser: () => void;
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
    const allUsers = storage.getUsers();
    const activeUser = storage.getActiveUser();
    const theme = (activeUser?.theme || storage.getTheme() || getSystemThemePreference()) as Theme;
    const insight = storage.getLastInsight();

    if (activeUser) {
      // Check if we need to apply inactivity penalty (-20 points if no log in 48+ hours)
      let finalScore = activeUser.ecoScore;
      let newNotifications = [...activeUser.notifications];
      
      if (activeUser.onboarded && activeUser.logs.length > 0) {
        const now = Date.now();
        const latestLog = activeUser.logs.reduce((latest, current) => {
          return new Date(current.date).getTime() > new Date(latest.date).getTime() ? current : latest;
        });
        const lastLogMs = new Date(latestLog.date).getTime();
        const hoursSinceLastLog = (now - lastLogMs) / (1000 * 60 * 60);

        const lastPenaltyApplied = typeof window !== 'undefined' ? localStorage.getItem(`carbonlens_last_penalty_time_${activeUser.id}`) : null;
        const lastPenaltyMs = lastPenaltyApplied ? parseInt(lastPenaltyApplied, 10) : 0;

        if (hoursSinceLastLog >= 48 && lastPenaltyMs < lastLogMs) {
          finalScore = Math.max(activeUser.ecoScore - 20, 0);
          
          if (typeof window !== 'undefined') {
            localStorage.setItem(`carbonlens_last_penalty_time_${activeUser.id}`, String(now));
          }

          const penaltyNotif: Notification = {
            id: `penalty-${now}`,
            icon: '⚠️',
            text: 'Inactivity penalty applied: -20 points (no logs in 48h)',
            timestamp: now,
            read: false,
          };
          newNotifications = [penaltyNotif, ...newNotifications].slice(0, 50);
          
          dispatch({ type: 'APPLY_PENALTY', payload: { penalty: 20 } });
          dispatch({ type: 'ADD_NOTIFICATION', payload: penaltyNotif });
          showToast('Inactivity penalty: -20 points ⚠️', 'warning');
        }
      }

      dispatch({
        type: 'INIT_STATE',
        payload: {
          activeUser,
          allUsers,
          profile: activeUser.profile,
          logs: activeUser.logs,
          challenges: activeUser.challenges.length === 0 ? DEFAULT_CHALLENGES : activeUser.challenges,
          score: finalScore,
          notifications: newNotifications,
          theme,
          insight,
        },
      });
    } else {
      dispatch({
        type: 'INIT_STATE',
        payload: {
          activeUser: null,
          allUsers,
          profile: null,
          logs: [],
          challenges: DEFAULT_CHALLENGES,
          score: 0,
          notifications: [],
          theme,
          insight,
        },
      });
    }

    applyTheme(theme);
  }, []);

  // 2. Write active user states to storage when they change
  useEffect(() => {
    if (state.activeUser) {
      const updatedUser: User = {
        ...state.activeUser,
        profile: state.profile,
        logs: state.logs,
        challenges: state.challenges,
        ecoScore: state.score,
        level: getLevelDetails(state.score).level,
        notifications: state.notifications,
        theme: state.theme,
        onboarded: state.profile ? state.profile.isOnboarded : false,
        lastActive: new Date().toISOString().split('T')[0],
      };
      storage.saveUser(updatedUser);
    }
  }, [state.profile, state.logs, state.challenges, state.score, state.notifications, state.theme]);

  // 3. Keep allUsers and activeUser references in sync with localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const activeUser = storage.getActiveUser();
      const allUsers = storage.getUsers();
      dispatch({
        type: 'INIT_STATE',
        payload: { activeUser, allUsers }
      });
    }
  }, [state.profile, state.logs, state.challenges, state.score, state.notifications, state.theme]);

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

    let pointsEarned = SCORING_EVENTS.ACTIVITY_LOGGED;
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const loggedYesterday = state.logs.some((l) => l.date === yesterdayStr);
    const loggedTodayAlready = state.logs.some((l) => l.date === todayStr);
    if (loggedYesterday && !loggedTodayAlready) {
      pointsEarned += SCORING_EVENTS.STREAK_MAINTAINED;
      showToast('Daily log streak maintained! +20 points 🔥');
    }

    let loggedLast7Days = true;
    for (let i = 1; i < 7; i++) {
      const checkDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      if (!state.logs.some((l) => l.date === checkDate)) {
        loggedLast7Days = false;
        break;
      }
    }
    const alreadyAwarded7DayToday = state.notifications.some(
      (n) => n.id === `7-day-streak-${todayStr}`
    );
    if (loggedLast7Days && !loggedTodayAlready && !alreadyAwarded7DayToday) {
      pointsEarned += SCORING_EVENTS.STREAK_7_DAY;
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

    const updatedLogs = [entry, ...state.logs];
    const newNotifs = checkAndGenerateNotifications(updatedLogs, state.challenges, state.notifications);
    if (newNotifs.length > state.notifications.length) {
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
    dispatch({ type: 'COMPLETE_CHALLENGE', payload: { id, pointsEarned: 50 } });
    const challenge = state.challenges.find((c) => c.id === id);
    
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

    const lastFetch = typeof window !== 'undefined' ? localStorage.getItem(`carbonlens_last_insight_fetch_${state.activeUser?.id}`) : null;
    const lastFetchMs = lastFetch ? parseInt(lastFetch, 10) : 0;
    const now = Date.now();
    const elapsedMinutes = (now - lastFetchMs) / (1000 * 60);

    if (!force && elapsedMinutes < 5 && state.insight) {
      showToast('AI insight is up to date (5m debounce)', 'info');
      return;
    }

    dispatch({ type: 'SET_INSIGHT_LOADING', payload: true });

    try {
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

      const categories = Object.entries(monthlyTotals) as [keyof typeof monthlyTotals, number][];
      const topCategory = categories.reduce((max, curr) => (curr[1] > max[1] ? curr : max), categories[0])[0];

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
      
      if (typeof window !== 'undefined' && state.activeUser) {
        localStorage.setItem(`carbonlens_last_insight_fetch_${state.activeUser.id}`, String(now));
      }
      showToast('CarbonLens AI insights updated! 🤖');
    } catch (e: any) {
      console.error('Failed to fetch Gemini insights:', e);
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

  // Multi-user Helpers
  const selectUser = (id: string) => {
    storage.setActiveUser(id);
    const user = storage.getActiveUser();
    const allUsers = storage.getUsers();
    if (user) {
      dispatch({
        type: 'INIT_STATE',
        payload: {
          activeUser: user,
          allUsers,
          profile: user.profile,
          logs: user.logs,
          challenges: user.challenges.length === 0 ? DEFAULT_CHALLENGES : user.challenges,
          score: user.ecoScore,
          notifications: user.notifications,
          theme: user.theme,
        },
      });
      applyTheme(user.theme);
      showToast(`Switched to user: ${user.name} 👋`);
    }
  };

  const createNewUser = (name: string, city: string, avatar: string) => {
    const newUser = storage.createUser(name, city, avatar);
    storage.setActiveUser(newUser.id);
    const allUsers = storage.getUsers();
    
    dispatch({
      type: 'INIT_STATE',
      payload: {
        activeUser: newUser,
        allUsers,
        profile: null,
        logs: [],
        challenges: DEFAULT_CHALLENGES,
        score: 0,
        notifications: [],
        theme: 'dark',
      },
    });
    applyTheme('dark');
    showToast(`Welcome ${name}! User profile created.`);
  };

  const deleteUserAccount = (id: string) => {
    storage.deleteUser(id);
    const activeUser = storage.getActiveUser();
    const allUsers = storage.getUsers();
    
    dispatch({
      type: 'INIT_STATE',
      payload: {
        activeUser,
        allUsers,
        profile: activeUser ? activeUser.profile : null,
        logs: activeUser ? activeUser.logs : [],
        challenges: activeUser ? activeUser.challenges : DEFAULT_CHALLENGES,
        score: activeUser ? activeUser.ecoScore : 0,
        notifications: activeUser ? activeUser.notifications : [],
        theme: activeUser ? activeUser.theme : 'dark',
      },
    });
    if (activeUser) {
      applyTheme(activeUser.theme);
    }
    showToast('User account deleted.');
  };

  const resetActiveUserData = () => {
    const user = storage.getActiveUser();
    if (user) {
      user.logs = [];
      user.challenges = DEFAULT_CHALLENGES;
      user.ecoScore = 0;
      user.level = 'Carbon Rookie';
      user.notifications = [];
      user.profile = null;
      user.onboarded = false;
      storage.saveUser(user);
      
      dispatch({
        type: 'INIT_STATE',
        payload: {
          activeUser: user,
          profile: null,
          logs: [],
          challenges: DEFAULT_CHALLENGES,
          score: 0,
          notifications: [],
          allUsers: storage.getUsers(),
        },
      });
      showToast('All progress and logs have been reset.');
    }
  };

  const updateActiveUserMetadata = (name: string, city: string, avatar: string) => {
    const user = storage.getActiveUser();
    if (user) {
      user.name = name;
      user.city = city;
      user.avatar = avatar;
      storage.saveUser(user);
      
      dispatch({
        type: 'INIT_STATE',
        payload: {
          activeUser: user,
          allUsers: storage.getUsers(),
        },
      });
      showToast('Profile metadata updated.');
    }
  };

  const switchUser = () => {
    storage.setActiveUser(null);
    dispatch({
      type: 'INIT_STATE',
      payload: {
        activeUser: null,
        profile: null,
        logs: [],
        challenges: DEFAULT_CHALLENGES,
        score: 0,
        notifications: [],
        allUsers: storage.getUsers(),
      },
    });
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
        // Multi-user
        selectUser,
        createNewUser,
        deleteUserAccount,
        resetActiveUserData,
        updateActiveUserMetadata,
        switchUser,
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
