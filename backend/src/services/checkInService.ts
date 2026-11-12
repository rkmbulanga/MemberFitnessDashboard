import { randomUUID } from 'node:crypto';
import type { DataStore } from '../stores/dataStore.js';
import type { CheckIn } from '../types/index.js';
import { NotFound, Conflict } from './errors.js';
import { getMember } from './memberService.js';
import { calculateStreak } from './streak.js';

const ONE_HOUR_MS = 60 * 60 * 1000;

export function recordCheckIn(
  store: DataStore,
  memberId: string,
  gymId: string,
): CheckIn {
  getMember(store, memberId);
  if (!store.gyms.has(gymId)) throw NotFound(`Gym ${gymId} not found`);

  const now = Date.now();
  const recent = store.checkIns.find(
    (c) =>
      c.memberId === memberId &&
      now - new Date(c.timestamp).getTime() < ONE_HOUR_MS,
  );
  if (recent) {
    throw Conflict('Member already checked in within the last hour');
  }

  const checkIn: CheckIn = {
    id: randomUUID(),
    memberId,
    gymId,
    timestamp: new Date(now).toISOString(),
  };
  store.checkIns.push(checkIn);
  return checkIn;
}

export interface CheckInHistory {
  checkIns: CheckIn[];
  streak: number;
}

export function getCheckInHistory(
  store: DataStore,
  memberId: string,
): CheckInHistory {
  getMember(store, memberId);

  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const checkIns = store.checkIns
    .filter(
      (c) =>
        c.memberId === memberId && new Date(c.timestamp).getTime() >= cutoff,
    )
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

  return { checkIns, streak: calculateStreak(checkIns) };
}
