import type { DataStore } from '../stores/dataStore.js';
import type { FitnessClass, ClassType, Booking } from '../types/index.js';
import { NotFound, BadRequest, Conflict } from './errors.js';
import { getMember } from './memberService.js';

export interface ClassFilter {
  date?: string;
  type?: ClassType;
}

export function listClasses(
  store: DataStore,
  gymId: string,
  filter: ClassFilter = {},
): FitnessClass[] {
  if (!store.gyms.has(gymId)) throw NotFound(`Gym ${gymId} not found`);

  let result = [...store.classes.values()].filter((c) => c.gymId === gymId);

  if (filter.date) {
    result = result.filter(
      (c) => c.startsAt.slice(0, 10) === filter.date,
    );
  }
  if (filter.type) {
    result = result.filter((c) => c.type === filter.type);
  }

  return result.sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );
}

export function bookClass(
  store: DataStore,
  classId: string,
  memberId: string,
): FitnessClass {
  getMember(store, memberId);

  const cls = store.classes.get(classId);
  if (!cls) throw NotFound(`Class ${classId} not found`);

  if (new Date(cls.startsAt).getTime() <= Date.now()) {
    throw BadRequest('Cannot book a class that has already started');
  }
  if (cls.bookedMemberIds.includes(memberId)) {
    throw Conflict('Member is already booked for this class');
  }
  if (cls.bookedMemberIds.length >= cls.capacity) {
    throw Conflict('Class is full');
  }

  cls.bookedMemberIds.push(memberId);
  store.classes.set(classId, cls);
  return cls;
}

export function cancelBooking(
  store: DataStore,
  classId: string,
  memberId: string,
): FitnessClass {
  const cls = store.classes.get(classId);
  if (!cls) throw NotFound(`Class ${classId} not found`);

  const idx = cls.bookedMemberIds.indexOf(memberId);
  if (idx === -1) {
    throw NotFound('Member does not have a booking for this class');
  }

  cls.bookedMemberIds.splice(idx, 1);
  store.classes.set(classId, cls);
  return cls;
}

export function listMemberBookings(
  store: DataStore,
  memberId: string,
): Booking[] {
  getMember(store, memberId);

  const now = Date.now();
  return [...store.classes.values()]
    .filter(
      (c) =>
        c.bookedMemberIds.includes(memberId) &&
        new Date(c.startsAt).getTime() > now,
    )
    .sort(
      (a, b) =>
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    )
    .map((c) => ({
      classId: c.id,
      memberId,
      bookedAt: c.startsAt,
    }));
}
