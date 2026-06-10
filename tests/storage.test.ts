/**
 * @file storage.test.ts
 * @description Unit tests for LocalStorage wrapper operations, checking profiles, streaks, and data exports.
 *
 * @module Tests
 * @author CarbonLens Team
 */

// @vitest-environment jsdom
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { storage } from '../lib/storage';
import { UserProfile, LogEntry } from '../types';

const localStorageStore: Record<string, string> = {};

Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: vi.fn((key: string) => localStorageStore[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      localStorageStore[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete localStorageStore[key];
    }),
    clear: vi.fn(() => {
      Object.keys(localStorageStore).forEach((k) => delete localStorageStore[k]);
    }),
  },
  writable: true,
});

describe('LocalStorage Storage Wrappers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('onboarding state operations', () => {
    expect(storage.getOnboarded()).toBe(false);
    storage.setOnboarded(true);
    expect(storage.getOnboarded()).toBe(true);
  });

  test('profile save and retrieve', () => {
    expect(storage.getProfile()).toBeNull();

    const mockProfile: UserProfile = {
      transport: 'EV',
      diet: 'Vegan',
      energy: 'Fully renewable',
      flights: 'None',
      shopping: 'Minimal',
      baselineCo2: 1200,
      isOnboarded: true,
    };

    storage.setProfile(mockProfile);
    const retrieved = storage.getProfile();
    expect(retrieved).toEqual(mockProfile);
  });

  test('activity logs collection save and retrieve', () => {
    expect(storage.getLogs()).toEqual([]);

    const mockLogs: LogEntry[] = [
      {
        id: '123',
        category: 'transport',
        date: '2026-06-10',
        description: 'Test ride',
        co2: 1.5,
        details: {},
      },
    ];

    storage.setLogs(mockLogs);
    expect(storage.getLogs()).toEqual(mockLogs);
  });

  test('full export data compiles correctly', () => {
    const mockProfile: UserProfile = {
      transport: 'EV',
      diet: 'Vegan',
      energy: 'Fully renewable',
      flights: 'None',
      shopping: 'Minimal',
      baselineCo2: 1200,
      isOnboarded: true,
    };

    storage.setProfile(mockProfile);
    storage.setOnboarded(true);
    storage.setScore(450);

    const exportData = storage.exportAllData();
    // Verify it contains formatting spaces
    expect(exportData).toContain('"carbonlens_score": 450');
    expect(exportData).toContain('"carbonlens_onboarded": true');
    expect(exportData).toContain('"carbonlens_profile": {');
  });
});
