import { UserProfile, LogEntry, Challenge, Notification, Theme, InsightResponse } from '../types';

const KEYS = {
  ONBOARDED: 'carbonlens_onboarded',
  PROFILE: 'carbonlens_profile',
  LOGS: 'carbonlens_logs',
  CHALLENGES: 'carbonlens_challenges',
  SCORE: 'carbonlens_score',
  NOTIFICATIONS: 'carbonlens_notifications',
  THEME: 'carbonlens_theme',
  LAST_INSIGHT: 'carbonlens_last_insight',
};

export const storage = {
  // Onboarding Status
  getOnboarded(): boolean {
    try {
      if (typeof window === 'undefined') return false;
      const val = localStorage.getItem(KEYS.ONBOARDED);
      return val === 'true';
    } catch (e) {
      console.error('Error reading onboarding status from storage:', e);
      return false;
    }
  },
  setOnboarded(value: boolean): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(KEYS.ONBOARDED, String(value));
    } catch (e) {
      console.error('Error writing onboarding status to storage:', e);
    }
  },

  // User Profile
  getProfile(): UserProfile | null {
    try {
      if (typeof window === 'undefined') return null;
      const data = localStorage.getItem(KEYS.PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error reading profile from storage:', e);
      return null;
    }
  },
  setProfile(profile: UserProfile): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Error writing profile to storage:', e);
    }
  },

  // Activity Logs
  getLogs(): LogEntry[] {
    try {
      if (typeof window === 'undefined') return [];
      const data = localStorage.getItem(KEYS.LOGS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading logs from storage:', e);
      return [];
    }
  },
  setLogs(logs: LogEntry[]): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('Error writing logs to storage:', e);
    }
  },

  // Challenges
  getChallenges(): Challenge[] {
    try {
      if (typeof window === 'undefined') return [];
      const data = localStorage.getItem(KEYS.CHALLENGES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading challenges from storage:', e);
      return [];
    }
  },
  setChallenges(challenges: Challenge[]): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(KEYS.CHALLENGES, JSON.stringify(challenges));
    } catch (e) {
      console.error('Error writing challenges to storage:', e);
    }
  },

  // Eco Score
  getScore(): number {
    try {
      if (typeof window === 'undefined') return 0;
      const val = localStorage.getItem(KEYS.SCORE);
      return val ? parseInt(val, 10) : 0;
    } catch (e) {
      console.error('Error reading score from storage:', e);
      return 0;
    }
  },
  setScore(score: number): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(KEYS.SCORE, String(score));
    } catch (e) {
      console.error('Error writing score to storage:', e);
    }
  },

  // Notifications
  getNotifications(): Notification[] {
    try {
      if (typeof window === 'undefined') return [];
      const data = localStorage.getItem(KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading notifications from storage:', e);
      return [];
    }
  },
  setNotifications(notifications: Notification[]): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.error('Error writing notifications to storage:', e);
    }
  },

  // Theme
  getTheme(): Theme | null {
    try {
      if (typeof window === 'undefined') return null;
      return localStorage.getItem(KEYS.THEME) as Theme | null;
    } catch (e) {
      console.error('Error reading theme from storage:', e);
      return null;
    }
  },
  setTheme(theme: Theme): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(KEYS.THEME, theme);
    } catch (e) {
      console.error('Error writing theme to storage:', e);
    }
  },

  // Last AI Insight
  getLastInsight(): InsightResponse | null {
    try {
      if (typeof window === 'undefined') return null;
      const data = localStorage.getItem(KEYS.LAST_INSIGHT);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error reading last insight from storage:', e);
      return null;
    }
  },
  setLastInsight(insight: InsightResponse): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(KEYS.LAST_INSIGHT, JSON.stringify(insight));
    } catch (e) {
      console.error('Error writing last insight to storage:', e);
    }
  },

  // Export data
  exportAllData(): string {
    try {
      if (typeof window === 'undefined') return '{}';
      const allData: Record<string, unknown> = {};
      Object.values(KEYS).forEach((key) => {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            allData[key] = JSON.parse(value);
          } catch {
            allData[key] = value;
          }
        }
      });
      return JSON.stringify(allData, null, 2);
    } catch (e) {
      console.error('Error exporting data:', e);
      return '{}';
    }
  }
};
