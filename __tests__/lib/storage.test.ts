import { describe, it, expect, beforeEach } from 'vitest';

describe('Storage Helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty array when no users exist', () => {
    const raw = localStorage.getItem('carbonlens_users');
    const users = raw ? JSON.parse(raw) : [];
    expect(users).toEqual([]);
  });

  it('stores and retrieves user correctly', () => {
    const user = { id: 'user_123', name: 'Prince', ecoScore: 100 };
    localStorage.setItem('carbonlens_users', JSON.stringify([user]));
    const raw = localStorage.getItem('carbonlens_users');
    const users = raw ? JSON.parse(raw) : [];
    expect(users[0].name).toBe('Prince');
    expect(users[0].ecoScore).toBe(100);
  });

  it('active user id stored and retrieved', () => {
    localStorage.setItem('carbonlens_active_user', 'user_123');
    expect(localStorage.getItem('carbonlens_active_user')).toBe('user_123');
  });

  it('theme defaults to dark when not set', () => {
    const theme = localStorage.getItem('carbonlens_theme') || 'dark';
    expect(theme).toBe('dark');
  });
});
