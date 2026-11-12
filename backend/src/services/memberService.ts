import type { DataStore } from '../stores/dataStore.js';
import type {
  Member,
  MemberStats,
  NotificationSettings,
} from '../types/index.js';
import { NotFound, BadRequest } from './errors.js';
import { calculateStreak } from './streak.js';

export function getMember(store: DataStore, id: string): Member {
  const member = store.members.get(id);
  if (!member) throw NotFound(`Member ${id} not found`);
  return member;
}

export function getMemberStats(store: DataStore, id: string): MemberStats {
  getMember(store, id);

  const memberCheckIns = store.checkIns.filter((c) => c.memberId === id);
  const totalVisits = memberCheckIns.length;
  const currentStreak = calculateStreak(memberCheckIns);

  const gymCounts = new Map<string, number>();
  for (const ci of memberCheckIns) {
    gymCounts.set(ci.gymId, (gymCounts.get(ci.gymId) ?? 0) + 1);
  }
  let favoriteGymId: string | null = null;
  let max = 0;
  for (const [gymId, count] of gymCounts) {
    if (count > max) {
      max = count;
      favoriteGymId = gymId;
    }
  }

  let classesAttended = 0;
  for (const cls of store.classes.values()) {
    if (cls.bookedMemberIds.includes(id)) classesAttended += 1;
  }

  return { totalVisits, currentStreak, favoriteGymId, classesAttended };
}

export interface UpdatePreferencesInput {
  preferredGymId?: string;
  notifications?: NotificationSettings;
}

export function updatePreferences(
  store: DataStore,
  id: string,
  input: UpdatePreferencesInput,
): Member {
  const member = getMember(store, id);

  if (input.preferredGymId !== undefined) {
    if (!store.gyms.has(input.preferredGymId)) {
      throw BadRequest(`Gym ${input.preferredGymId} does not exist`);
    }
    member.preferredGymId = input.preferredGymId;
  }

  if (input.notifications !== undefined) {
    member.notifications = input.notifications;
  }

  store.members.set(id, member);
  return member;
}
