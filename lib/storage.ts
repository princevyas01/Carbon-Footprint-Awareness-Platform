/**
 * @file storage.ts
 * @description LocalStorage wrapper service for managing users, active profile data, logs, challenges, score state, and theme settings.
 *
 * @module Storage
 * @author CarbonLens Team
 */

import { User, UserProfile, LogEntry, Challenge, Notification, Theme, InsightResponse } from '../types';
import { STORAGE_KEYS } from './constants';

export const storage = {
  /**
   * Retrieves all registered users from localStorage.
   * @returns Array of user profiles
   */
  getUsers(): User[] {
    try {
      if (typeof window === 'undefined') return [];
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('[storage.getUsers]: Failed to read users:', e);
      return [];
    }
  },

  /**
   * Retrieves the currently active user profile.
   * @returns The active user profile, or null if no user is active
   */
  getActiveUser(): User | null {
    try {
      if (typeof window === 'undefined') return null;
      const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
      if (!activeId) {
        // Fallback: if users exist but no active ID is set, select first
        const users = this.getUsers();
        if (users.length > 0) {
          localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, users[0].id);
          return users[0];
        }
        return null;
      }
      const users = this.getUsers();
      return users.find((u) => u.id === activeId) || null;
    } catch (e) {
      console.error('[storage.getActiveUser]: Failed to read active user:', e);
      return null;
    }
  },

  /**
   * Saves or updates a user profile in the storage.
   * @param user - The user object to persist
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
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error('[storage.saveUser]: Failed to save user:', e);
    }
  },

  /**
   * Sets the ID of the active user.
   * @param id - The active user's unique identifier (or null to clear active user)
   */
  setActiveUser(id: string | null): void {
    try {
      if (typeof window === 'undefined') return;
      if (id === null) {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
      } else {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, id);
      }
    } catch (e) {
      console.error('[storage.setActiveUser]: Failed to set active user:', e);
    }
  },

  /**
   * Creates a new user profile with default states.
   * @param name - The user's name
   * @param city - The user's city
   * @param avatar - Selected emoji avatar representation
   * @returns The newly created User object
   */
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

  /**
   * Deletes a user account and handles active user re-selection if necessary.
   * @param id - The ID of the user to delete
   */
  deleteUser(id: string): void {
    try {
      if (typeof window === 'undefined') return;
      let users = this.getUsers();
      users = users.filter((u) => u.id !== id);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      // If deleted active user, clean active user ID
      const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
      if (activeId === id) {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
        if (users.length > 0) {
          localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, users[0].id);
        }
      }
    } catch (e) {
      console.error('[storage.deleteUser]: Failed to delete user:', e);
    }
  },

  /**
   * Internal helper to ensure an active user exists (useful for tests or fallback).
   * @returns The active user profile
   */
  _ensureActiveUser(): User {
    let user = this.getActiveUser();
    if (!user) {
      user = this.createUser('Default User', '', '🌱');
      this.setActiveUser(user.id);
    }
    return user;
  },

  /**
   * Gets the onboarding status of the active user.
   * @returns True if onboarded
   */
  getOnboarded(): boolean {
    const user = this.getActiveUser();
    return user ? user.onboarded : false;
  },

  /**
   * Sets the onboarding status of the active user.
   * @param value - New onboarding flag value
   */
  setOnboarded(value: boolean): void {
    const user = this._ensureActiveUser();
    user.onboarded = value;
    this.saveUser(user);
  },

  /**
   * Gets the active user's questionnaire profile details.
   * @returns The profile object, or null
   */
  getProfile(): UserProfile | null {
    const user = this.getActiveUser();
    return user ? user.profile : null;
  },

  /**
   * Saves the onboarding questionnaire profile.
   * @param profile - Questionnaire results
   */
  setProfile(profile: UserProfile): void {
    const user = this._ensureActiveUser();
    user.profile = profile;
    this.saveUser(user);
  },

  /**
   * Retrieves logged activities.
   * @returns Array of log entries
   */
  getLogs(): LogEntry[] {
    const user = this.getActiveUser();
    return user ? user.logs : [];
  },

  /**
   * Saves list of log entries.
   * @param logs - Array of activity logs to save
   */
  setLogs(logs: LogEntry[]): void {
    const user = this._ensureActiveUser();
    user.logs = logs;
    this.saveUser(user);
  },

  /**
   * Retrieves active/available challenges.
   * @returns Array of challenges
   */
  getChallenges(): Challenge[] {
    const user = this.getActiveUser();
    return user ? user.challenges : [];
  },

  /**
   * Saves list of challenges.
   * @param challenges - Array of challenges to save
   */
  setChallenges(challenges: Challenge[]): void {
    const user = this._ensureActiveUser();
    user.challenges = challenges;
    this.saveUser(user);
  },

  /**
   * Gets user's eco score.
   * @returns Gamification score
   */
  getScore(): number {
    const user = this.getActiveUser();
    return user ? user.ecoScore : 0;
  },

  /**
   * Sets user's eco score.
   * @param score - New score to set
   */
  setScore(score: number): void {
    const user = this._ensureActiveUser();
    user.ecoScore = score;
    this.saveUser(user);
  },

  /**
   * Retrieves system notifications.
   * @returns Array of user notifications
   */
  getNotifications(): Notification[] {
    const user = this.getActiveUser();
    return user ? user.notifications : [];
  },

  /**
   * Saves in-app notifications list.
   * @param notifications - Notification array to save
   */
  setNotifications(notifications: Notification[]): void {
    const user = this._ensureActiveUser();
    user.notifications = notifications;
    this.saveUser(user);
  },

  /**
   * Gets theme setting of active user.
   * @returns The active theme choice
   */
  getTheme(): Theme | null {
    const user = this.getActiveUser();
    return user ? user.theme : 'dark';
  },

  /**
   * Sets theme setting for the active user.
   * @param theme - Selected color scheme theme
   */
  setTheme(theme: Theme): void {
    const user = this._ensureActiveUser();
    user.theme = theme;
    this.saveUser(user);
  },

  /**
   * Retrieves the cached last AI insight response.
   * @returns Cached AI insight, or null
   */
  getLastInsight(): InsightResponse | null {
    try {
      if (typeof window === 'undefined') return null;
      const data = localStorage.getItem(STORAGE_KEYS.LAST_INSIGHT);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('[storage.getLastInsight]: Failed to read last insight:', e);
      return null;
    }
  },

  /**
   * Caches the last AI insight response.
   * @param insight - The insight response to cache
   */
  setLastInsight(insight: InsightResponse): void {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(STORAGE_KEYS.LAST_INSIGHT, JSON.stringify(insight));
    } catch (e) {
      console.error('[storage.setLastInsight]: Failed to write last insight:', e);
    }
  },

  /**
   * Packages and exports all active user data as a formatted JSON string.
   * @returns Stringified JSON data bundle
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
