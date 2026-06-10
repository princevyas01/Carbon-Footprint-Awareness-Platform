/**
 * @file notifications.test.ts
 * @description Unit tests for the carbon notification engine rules, covering daily reminders, emission warnings, challenge deadlines, and milestones.
 *
 * @module Tests
 * @author CarbonLens Team
 */

import { describe, test, expect, afterEach, vi } from 'vitest';
import { checkAndGenerateNotifications } from '../lib/notifications';
import { LogEntry, Challenge } from '../types';
import { INDIA_MONTHLY_AVG_KG } from '../lib/constants';

describe('Carbon Notification Engine Rules', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('empty state yields only the daily log reminder', () => {
    const notifications = checkAndGenerateNotifications([], [], []);
    expect(notifications.length).toBe(1);
    expect(notifications[0].icon).toBe('🔥');
  });

  test('no reminder generated if user has logged today', () => {
    const today = new Date().toISOString().split('T')[0];
    const logs: LogEntry[] = [
      { id: '1', category: 'food', date: today, description: 'Lunch thali', co2: 0.5, details: {} },
    ];
    const notifications = checkAndGenerateNotifications(logs, [], []);
    const reminder = notifications.find((n) => n.text.includes('Keep your streak alive'));
    expect(reminder).toBeUndefined();
  });

  test('transport emission increase warning triggers correct alerts', () => {
    const today = new Date().toISOString().split('T')[0];
    
    const logs: LogEntry[] = [
      { id: 'today-log', category: 'food', date: today, description: 'Food log', co2: 0.5, details: {} },
      { id: '1', category: 'transport', date: today, description: 'Drive', co2: 35, details: {} },
      {
        id: '2',
        category: 'transport',
        date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Drive',
        co2: 20,
        details: {},
      },
    ];

    const newNotifs = checkAndGenerateNotifications(logs, [], []);
    const transportWarning = newNotifs.find((n) => n.id.startsWith('transport-rose-'));
    expect(transportWarning).toBeDefined();
    expect(transportWarning?.icon).toBe('🚗');
  });

  test('active challenge deadline within 48 hours (2 days remaining) triggers alert', () => {
    const today = new Date();
    const startDate = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const activeChallenges: Challenge[] = [
      {
        id: 'lights-out-9pm',
        name: 'Lights Out 9PM',
        emoji: '💡',
        duration: '7 days',
        durationDays: 7,
        co2SavedPotential: 3.0,
        difficulty: 'Easy',
        description: 'No non-essential power 9pm–6am',
        status: 'Active',
        startDate,
        checkedDays: [],
        streak: 0,
      },
    ];

    const newNotifs = checkAndGenerateNotifications([], activeChallenges, []);
    const deadlineWarning = newNotifs.find((n) => n.id === 'challenge-deadline-lights-out-9pm');
    expect(deadlineWarning).toBeDefined();
    expect(deadlineWarning?.icon).toBe('🎯');
  });

  test('30-day streak milestone notification triggers', () => {
    // Generate logs for 30 consecutive days
    const logs: LogEntry[] = [];
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    for (let i = 0; i < 30; i++) {
      const dateStr = new Date(now - i * oneDayMs).toISOString().split('T')[0];
      logs.push({
        id: `log-${i}`,
        category: 'food',
        date: dateStr,
        description: 'Mock Food',
        co2: 0.2,
        details: {},
      });
    }

    const notifications = checkAndGenerateNotifications(logs, [], []);
    const streak30 = notifications.find((n) => n.id === 'milestone-30-days');
    expect(streak30).toBeDefined();
    expect(streak30?.icon).toBe('🏆');
    expect(streak30?.text).toContain('30 days in a row');
  });

  test('monthly summary report triggers on the 1st of the month', () => {
    // Set system date to June 1st, 2026
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-01T12:00:00Z'));

    const logs: LogEntry[] = [
      // Log in May (previous month)
      {
        id: 'may-log',
        category: 'transport',
        date: '2026-05-15',
        description: 'May trip',
        co2: 50.0,
        details: {},
      },
      // Log today (June 1st) to prevent logging reminder from shifting positions in expectations
      {
        id: 'june-log',
        category: 'food',
        date: '2026-06-01',
        description: 'June meal',
        co2: 0.5,
        details: {},
      },
    ];

    const notifications = checkAndGenerateNotifications(logs, [], []);
    const summaryNotif = notifications.find((n) => n.id.startsWith('monthly-summary-'));
    expect(summaryNotif).toBeDefined();
    expect(summaryNotif?.icon).toBe('📊');
    expect(summaryNotif?.text).toContain('May 2026 total: 50 kg');
  });

  test('below-average indicator triggers past mid-month', () => {
    // Set system date to June 20th (past 15th)
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-20T12:00:00Z'));

    const logs: LogEntry[] = [
      // Small emission logged today (June 20)
      {
        id: 'june-log',
        category: 'food',
        date: '2026-06-20',
        description: 'June meal',
        co2: 45.0, // below Indian average
        details: {},
      },
    ];

    const notifications = checkAndGenerateNotifications(logs, [], []);
    const belowAvg = notifications.find((n) => n.id.startsWith('below-average-'));
    expect(belowAvg).toBeDefined();
    expect(belowAvg?.icon).toBe('🌿');
    expect(belowAvg?.text).toContain("below India's average");
  });
});
