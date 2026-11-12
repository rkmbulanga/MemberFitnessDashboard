import { describe, it, expect } from 'vitest';
import { calculateStreak } from '../services/streak.js';
import type { CheckIn } from '../types/index.js';

function ci(daysAgo: number): CheckIn {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(10, 0, 0, 0);
  return { id: `ci-${daysAgo}`, memberId: 'm-1', gymId: 'gym-1', timestamp: d.toISOString() };
}

describe('calculateStreak (service function)', () => {
  const now = new Date();
  now.setHours(12, 0, 0, 0);

  it('returns 0 for no check-ins', () => {
    expect(calculateStreak([], now)).toBe(0);
  });

  it('counts consecutive days ending today', () => {
    expect(calculateStreak([ci(0), ci(1), ci(2)], now)).toBe(3);
  });

  it('counts a streak ending yesterday (grace period)', () => {
    expect(calculateStreak([ci(1), ci(2)], now)).toBe(2);
  });

  it('breaks the streak on a gap', () => {
    expect(calculateStreak([ci(0), ci(1), ci(3), ci(4)], now)).toBe(2);
  });

  it('collapses multiple same-day check-ins into one', () => {
    const twice = [ci(0), ci(0), ci(1)];
    expect(calculateStreak(twice, now)).toBe(2);
  });

  it('returns 0 when the most recent check-in is too old', () => {
    expect(calculateStreak([ci(3), ci(4)], now)).toBe(0);
  });
});
