import type { CheckIn } from '../types/index.js';

export function toDayKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

export function calculateStreak(
  checkIns: CheckIn[],
  now: Date = new Date(),
): number {
  if (checkIns.length === 0) return 0;

  const dayKeys = new Set<string>(checkIns.map((c) => toDayKey(c.timestamp)));

  const todayKey = now.toISOString().slice(0, 10);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  let cursor: Date;
  if (dayKeys.has(todayKey)) {
    cursor = new Date(now);
  } else if (dayKeys.has(yesterdayKey)) {
    cursor = yesterday;
  } else {
    return 0;
  }

  let streak = 0;
  while (dayKeys.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
