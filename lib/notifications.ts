/**
 * @file notifications.ts
 * @description Utility functions for examining user logs and active challenges to generate helpful system notifications.
 *
 * @module Notifications
 * @author CarbonLens Team
 */

import { LogEntry, Challenge, Notification } from '../types';
import { INDIA_MONTHLY_AVG_KG } from './constants';

/**
 * Checks active logs and challenges to generate smart in-app notifications.
 * Merges new notifications with existing ones to avoid duplicate spams.
 * @param logs - Array of user activity logs
 * @param challenges - Array of user challenges
 * @param existing - Existing list of notifications
 * @returns Combined and limited array of notifications (max 50)
 * @example
 * const updatedNotifs = checkAndGenerateNotifications(logs, challenges, existing);
 */
export function checkAndGenerateNotifications(
  logs: LogEntry[],
  challenges: Challenge[],
  existing: Notification[]
): Notification[] {
  const newNotifications: Notification[] = [];
  const now = Date.now();
  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to check if a notification of similar type was already generated today/recently
  const hasNotificationText = (text: string): boolean => {
    return existing.some((n) => n.text === text) || newNotifications.some((n) => n.text === text);
  };

  // 1. Keep streak alive notification
  // Check if today has any logs.
  const hasLogToday = logs.some((log) => log.date === todayStr);
  if (!hasLogToday) {
    const text = "Keep your streak alive — log today's activities";
    if (!hasNotificationText(text)) {
      newNotifications.push({
        id: `streak-remind-${todayStr}`,
        icon: '🔥',
        text,
        timestamp: now,
        read: false,
      });
    }
  }

  // 2. Transport emissions rose this week
  // Calculate transport emissions for last 7 days vs previous 7 days
  const oneDayMs = 24 * 60 * 60 * 1000;
  const getTransportEmissionsInRange = (startDaysAgo: number, endDaysAgo: number): number => {
    const startMs = now - startDaysAgo * oneDayMs;
    const endMs = now - endDaysAgo * oneDayMs;
    return logs
      .filter((log) => {
        const logMs = new Date(log.date).getTime();
        return log.category === 'transport' && logMs >= endMs && logMs <= startMs;
      })
      .reduce((sum, log) => sum + log.co2, 0);
  };

  const transportThisWeek = getTransportEmissionsInRange(0, 7);
  const transportLastWeek = getTransportEmissionsInRange(7, 14);

  if (transportLastWeek > 0 && (transportThisWeek - transportLastWeek) / transportLastWeek > 0.25) {
    const text = 'Your transport emissions rose this week';
    if (!hasNotificationText(text)) {
      newNotifications.push({
        id: `transport-rose-${todayStr}`,
        icon: '🚗',
        text,
        timestamp: now,
        read: false,
      });
    }
  }

  // 3. Challenge deadline (2 days before end)
  challenges.forEach((challenge) => {
    if (challenge.status === 'Active' && challenge.startDate) {
      const startMs = new Date(challenge.startDate).getTime();
      const durationMs = challenge.durationDays * oneDayMs;
      const endMs = startMs + durationMs;
      const msRemaining = endMs - now;
      const daysRemaining = Math.ceil(msRemaining / oneDayMs);

      if (daysRemaining === 2) {
        const text = `Your ${challenge.name} ends in 2 days`;
        const notificationId = `challenge-deadline-${challenge.id}`;
        if (!existing.some((n) => n.id === notificationId) && !newNotifications.some((n) => n.id === notificationId)) {
          newNotifications.push({
            id: notificationId,
            icon: '🎯',
            text,
            timestamp: now,
            read: false,
          });
        }
      }
    }
  });

  // 4. Monthly summary (1st of month)
  const todayDateObj = new Date();
  if (todayDateObj.getDate() === 1) {
    // Get last month name and year
    const lastMonthObj = new Date();
    lastMonthObj.setMonth(todayDateObj.getMonth() - 1);
    const lastMonthName = lastMonthObj.toLocaleString('default', { month: 'long' });
    const lastMonthYear = lastMonthObj.getFullYear();
    const lastMonthString = `${lastMonthName} ${lastMonthYear}`;

    // Calculate last month's total emissions
    const lastMonthLogs = logs.filter((log) => {
      const logDate = new Date(log.date);
      return (
        logDate.getMonth() === lastMonthObj.getMonth() &&
        logDate.getFullYear() === lastMonthObj.getFullYear()
      );
    });
    const lastMonthTotal = Number(lastMonthLogs.reduce((sum, log) => sum + log.co2, 0).toFixed(1));

    const text = `Your ${lastMonthString} total: ${lastMonthTotal} kg — here's how you did`;
    const notificationId = `monthly-summary-${lastMonthObj.getMonth()}-${lastMonthYear}`;

    if (lastMonthLogs.length > 0 && !existing.some((n) => n.id === notificationId) && !newNotifications.some((n) => n.id === notificationId)) {
      newNotifications.push({
        id: notificationId,
        icon: '📊',
        text,
        timestamp: now,
        read: false,
      });
    }
  }

  // 5. Milestone: 30 days in a row!
  // Compute current streak or consecutive log count
  // For simplicity, we check if the user has logs on 30 unique consecutive days leading to today
  let consecutiveDays = 0;
  const uniqueLogDates = new Set(logs.map((l) => l.date));
  for (let i = 0; i < 30; i++) {
    const checkDateStr = new Date(now - i * oneDayMs).toISOString().split('T')[0];
    if (uniqueLogDates.has(checkDateStr)) {
      consecutiveDays++;
    } else {
      break;
    }
  }

  if (consecutiveDays === 30) {
    const text = "You've logged 30 days in a row! 🔥";
    const notificationId = `milestone-30-days`;
    if (!existing.some((n) => n.id === notificationId) && !newNotifications.some((n) => n.id === notificationId)) {
      newNotifications.push({
        id: notificationId,
        icon: '🏆',
        text,
        timestamp: now,
        read: false,
      });
    }
  }

  // 6. Below average: You're below India's average this month!
  // Check emissions for current month so far.
  const currentMonthLogs = logs.filter((log) => {
    const logDate = new Date(log.date);
    return (
      logDate.getMonth() === todayDateObj.getMonth() &&
      logDate.getFullYear() === todayDateObj.getFullYear()
    );
  });
  const currentMonthTotal = currentMonthLogs.reduce((sum, log) => sum + log.co2, 0);

  // We notify if we are past mid-month, emissions are below the average, and we haven't notified for this month yet.
  if (todayDateObj.getDate() >= 15 && currentMonthTotal > 0 && currentMonthTotal < INDIA_MONTHLY_AVG_KG) {
    const text = "You're below India's average this month! 🌱";
    const notificationId = `below-average-${todayDateObj.getMonth()}-${todayDateObj.getFullYear()}`;
    if (!existing.some((n) => n.id === notificationId) && !newNotifications.some((n) => n.id === notificationId)) {
      newNotifications.push({
        id: notificationId,
        icon: '🌿',
        text,
        timestamp: now,
        read: false,
      });
    }
  }

  // Prepend new notifications so they appear at the top
  return [...newNotifications, ...existing].slice(0, 50); // Keep max 50 in memory
}
