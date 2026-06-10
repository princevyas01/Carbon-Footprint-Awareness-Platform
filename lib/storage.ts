import { User, UserProfile, LogEntry, Challenge, Notification, Theme, InsightResponse } from '../types';

const KEYS = {
  USERS: 'carbonlens_users',
  ACTIVE_USER_ID: 'carbonlens_active_user',
};

export const storage = {
  // Multi-user Helpers
  getUsers(): User[] {
    try {
      if (typeof window === 'undefined') return [];
      const data = localStorage.getItem(KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading users from storage:', e);
      return [];
    }
  },

  getActiveUser(): User | null {
    try {
      if (typeof window === 'undefined') return null;
      const activeId = localStorage.getItem(KEYS.ACTIVE_USER_ID);
      if (!activeId) {
        // Fallback: if users exist but no active ID is set, select first
        const users = this.getUsers();
        if (users.length > 0) {
          localStorage.setItem(KEYS.ACTIVE_USER_ID, users[0].id);
          return users[0];
        }
        return null;
      }
      const users = this.getUsers();
      return users.find((u) => u.id === activeId) || null;
    } catch (e) {
      console.error('Error reading active user from storage:', e);
      return null;
    }
  },

  saveUser(user: User): void {
    try {
      if (typeof window === 'undefined') return;
      const users = this.getUsers();
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx !== -1) {
        users[idx] = user;
      } else {
        users.push(user);
      }
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Error saving user to storage:', e);
    }
  },

  setActiveUser(id: string | null): void {
    try {
      if (typeof window === 'undefined') return;
      if (id === null) {
        localStorage.removeItem(KEYS.ACTIVE_USER_ID);
      } else {
        localStorage.setItem(KEYS.ACTIVE_USER_ID, id);
      }
    } catch (e) {
      console.error('Error setting active user ID in storage:', e);
    }
  },

  createUser(name: string, city: string, avatar: string): User {
    const today = new Date().toISOString().split('T')[0];
    const newUser: User = {
      id: 'user_' + Date.now().toString() + Math.random().toString(36).substring(2, 5),
      name,
      city,
      avatar: avatar || '🌱',
      createdAt: today,
      lastActive: today,
      onboarded: false,
      profile: null,
      logs: [],
      challenges: [],
      ecoScore: 0,
      level: 'Carbon Rookie',
      notifications: [],
      theme: 'dark',
      monthlyData: {},
    };
    this.saveUser(newUser);
    return newUser;
  },

  deleteUser(id: string): void {
    try {
      if (typeof window === 'undefined') return;
      let users = this.getUsers();
      users = users.filter((u) => u.id !== id);
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));

      // If deleted active user, clean active user ID
      const activeId = localStorage.getItem(KEYS.ACTIVE_USER_ID);
      if (activeId === id) {
        localStorage.removeItem(KEYS.ACTIVE_USER_ID);
        if (users.length > 0) {
          localStorage.setItem(KEYS.ACTIVE_USER_ID, users[0].id);
        }
      }
    } catch (e) {
      console.error('Error deleting user from storage:', e);
    }
  },

  // Helper to ensure an active user exists (useful for tests or fallback)
  _ensureActiveUser(): User {
    let user = this.getActiveUser();
    if (!user) {
      user = this.createUser('Default User', '', '🌱');
      this.setActiveUser(user.id);
    }
    return user;
  },

  // Backward-compatible individual getters/setters mapped to the active user
  getOnboarded(): boolean {
    const user = this.getActiveUser();
    return user ? user.onboarded : false;
  },
  setOnboarded(value: boolean): void {
    const user = this._ensureActiveUser();
    user.onboarded = value;
    this.saveUser(user);
  },

  getProfile(): UserProfile | null {
    const user = this.getActiveUser();
    return user ? user.profile : null;
  },
  setProfile(profile: UserProfile): void {
    const user = this._ensureActiveUser();
    user.profile = profile;
    this.saveUser(user);
  },

  getLogs(): LogEntry[] {
    const user = this.getActiveUser();
    return user ? user.logs : [];
  },
  setLogs(logs: LogEntry[]): void {
    const user = this._ensureActiveUser();
    user.logs = logs;
    this.saveUser(user);
  },

  getChallenges(): Challenge[] {
    const user = this.getActiveUser();
    return user ? user.challenges : [];
  },
  setChallenges(challenges: Challenge[]): void {
    const user = this._ensureActiveUser();
    user.challenges = challenges;
    this.saveUser(user);
  },

  getScore(): number {
    const user = this.getActiveUser();
    return user ? user.ecoScore : 0;
  },
  setScore(score: number): void {
    const user = this._ensureActiveUser();
    user.ecoScore = score;
    this.saveUser(user);
  },

  getNotifications(): Notification[] {
    const user = this.getActiveUser();
    return user ? user.notifications : [];
  },
  setNotifications(notifications: Notification[]): void {
    const user = this._ensureActiveUser();
    user.notifications = notifications;
    this.saveUser(user);
  },

  getTheme(): Theme | null {
    const user = this.getActiveUser();
    return user ? user.theme : 'dark';
  },
  setTheme(theme: Theme): void {
    const user = this._ensureActiveUser();
    user.theme = theme;
    this.saveUser(user);
  },

  getLastInsight(): InsightResponse | null {
    try {
      if (typeof window === 'undefined') return null;
      const data = localStorage.getItem('carbonlens_last_insight');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setLastInsight(insight: InsightResponse): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem('carbonlens_last_insight', JSON.stringify(insight));
    } catch {}
  },

  exportAllData(): string {
    const user = this.getActiveUser();
    if (!user) return '{}';
    const mockExport = {
      'carbonlens_score': user.ecoScore,
      'carbonlens_onboarded': user.onboarded,
      'carbonlens_profile': user.profile,
      'carbonlens_logs': user.logs,
      'carbonlens_challenges': user.challenges,
      'carbonlens_notifications': user.notifications,
      'carbonlens_theme': user.theme,
    };
    return JSON.stringify(mockExport, null, 2);
  }
};
