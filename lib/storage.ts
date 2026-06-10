/**
 * @file storage.ts
 * @description LocalStorage management utility for multi-user carbon tracking data.
 */

import { User, UserProfile, LogEntry, Challenge, Notification, Theme, InsightResponse } from '../types';

const KEYS = {
  USERS: 'carbonlens_users',
  ACTIVE_USER_ID: 'carbonlens_active_user',
};

export const storage = {
  // Multi-user Helpers
  /**
   * Retrieves the list of all created users from localStorage.
   * @returns Array of User objects
   */
  getUsers(): User[] {
    try {
      // Prevent Server-Side Rendering (SSR) crashes in Next.js by checking for window before accessing localStorage
      if (typeof window === 'undefined') return [];
      const data = localStorage.getItem(KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading users from storage:', e);
      return [];
    }
  },

  /**
   * Retrieves the currently active user from localStorage.
   * @returns The active User object or null if none active
   */
  getActiveUser(): User | null {
    try {
      // Prevent Server-Side Rendering (SSR) crashes in Next.js by checking for window before accessing localStorage
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

  /**
   * Saves or updates a user's data in the localStorage list.
   * @param user - The User object to save
   */
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

  /**
   * Sets the active user ID in localStorage.
   * @param id - The active user's ID, or null to clear it
   */
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

  /**
   * Creates a new user profile with default states.
   * @param name - The name of the user
   * @param city - The resident city of the user
   * @param avatar - The emoji character representing the user avatar
   * @returns The newly created User object
   */
  createUser(name: string, city: string, avatar: string): User {
    const today = new Date().toISOString().split('T')[0];
    const newUser: User = {
      // Combine timestamp and random string to ensure a globally unique identifier without external dependencies
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

  /**
   * Deletes a user from localStorage and resets active user if necessary.
   * @param id - The ID of the user to delete
   */
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

  /**
   * Ensures an active user exists, creating a default one if none is active.
   * @returns The existing or newly created active User object
   */
  _ensureActiveUser(): User {
    let user = this.getActiveUser();
    if (!user) {
      user = this.createUser('Default User', '', '🌱');
      this.setActiveUser(user.id);
    }
    return user;
  },

  // Backward-compatible individual getters/setters mapped to the active user
  /**
   * Gets the onboarding status of the active user.
   * @returns True if the active user is onboarded, otherwise false
   */
  getOnboarded(): boolean {
    const user = this.getActiveUser();
    return user ? user.onboarded : false;
  },
  /**
   * Sets the onboarding status of the active user.
   * @param value - The new onboarding status value
   */
  setOnboarded(value: boolean): void {
    const user = this._ensureActiveUser();
    user.onboarded = value;
    this.saveUser(user);
  },

  /**
   * Gets the profile details of the active user.
   * @returns The active UserProfile object or null
   */
  getProfile(): UserProfile | null {
    const user = this.getActiveUser();
    return user ? user.profile : null;
  },
  /**
   * Sets the profile details for the active user.
   * @param profile - The UserProfile object to assign
   */
  setProfile(profile: UserProfile): void {
    const user = this._ensureActiveUser();
    user.profile = profile;
    this.saveUser(user);
  },

  /**
   * Gets the activity logs of the active user.
   * @returns Array of LogEntry objects
   */
  getLogs(): LogEntry[] {
    const user = this.getActiveUser();
    return user ? user.logs : [];
  },
  /**
   * Sets the activity logs of the active user.
   * @param logs - The array of LogEntry objects
   */
  setLogs(logs: LogEntry[]): void {
    const user = this._ensureActiveUser();
    user.logs = logs;
    this.saveUser(user);
  },

  /**
   * Gets the challenges list of the active user.
   * @returns Array of Challenge objects
   */
  getChallenges(): Challenge[] {
    const user = this.getActiveUser();
    return user ? user.challenges : [];
  },
  /**
   * Sets the challenges list of the active user.
   * @param challenges - The array of Challenge objects
   */
  setChallenges(challenges: Challenge[]): void {
    const user = this._ensureActiveUser();
    user.challenges = challenges;
    this.saveUser(user);
  },

  /**
   * Gets the eco score of the active user.
   * @returns The current eco score
   */
  getScore(): number {
    const user = this.getActiveUser();
    return user ? user.ecoScore : 0;
  },
  /**
   * Sets the eco score of the active user.
   * @param score - The new eco score value
   */
  setScore(score: number): void {
    const user = this._ensureActiveUser();
    user.ecoScore = score;
    this.saveUser(user);
  },

  /**
   * Gets the notification list of the active user.
   * @returns Array of Notification objects
   */
  getNotifications(): Notification[] {
    const user = this.getActiveUser();
    return user ? user.notifications : [];
  },
  /**
   * Sets the notification list of the active user.
   * @param notifications - The array of Notification objects
   */
  setNotifications(notifications: Notification[]): void {
    const user = this._ensureActiveUser();
    user.notifications = notifications;
    this.saveUser(user);
  },

  /**
   * Gets the active theme of the active user.
   * @returns The Theme value or null
   */
  getTheme(): Theme | null {
    const user = this.getActiveUser();
    return user ? user.theme : 'dark';
  },
  /**
   * Sets the theme of the active user.
   * @param theme - The Theme value to apply
   */
  setTheme(theme: Theme): void {
    const user = this._ensureActiveUser();
    user.theme = theme;
    this.saveUser(user);
  },

  /**
   * Gets the cached AI insights response.
   * @returns The InsightResponse object or null
   */
  getLastInsight(): InsightResponse | null {
    try {
      if (typeof window === 'undefined') return null;
      const data = localStorage.getItem('carbonlens_last_insight');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  /**
   * Caches the AI insights response.
   * @param insight - The InsightResponse object to cache
   */
  setLastInsight(insight: InsightResponse): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem('carbonlens_last_insight', JSON.stringify(insight));
    } catch {}
  },

  /**
   * Exports all active user data into a JSON string format.
   * @returns A stringified JSON representation of active user data
   */
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
