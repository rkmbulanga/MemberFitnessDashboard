import type {
  Gym,
  Member,
  FitnessClass,
  CheckIn,
} from '../types/index.js';

function daysFromNow(days: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function hoursAgo(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

export interface DataStore {
  gyms: Map<string, Gym>;
  members: Map<string, Member>;
  classes: Map<string, FitnessClass>;
  checkIns: CheckIn[];
}

export function createStore(): DataStore {
  const gyms = new Map<string, Gym>([
    ['gym-1', { id: 'gym-1', name: 'Iron Harbor', city: 'Cape Town' }],
    ['gym-2', { id: 'gym-2', name: 'Summit Strength', city: 'Johannesburg' }],
    ['gym-3', { id: 'gym-3', name: 'Pulse Central', city: 'Durban' }],
  ]);

  const members = new Map<string, Member>([
    ['m-1', { id: 'm-1', name: 'Thandiwe Mokoena', email: 'thandiwe@example.com', tier: 'elite', homeGymId: 'gym-1', joinDate: '2024-03-01', preferredGymId: 'gym-1', notifications: { classReminders: true, streakAlerts: true } }],
    ['m-2', { id: 'm-2', name: 'James Okafor', email: 'james@example.com', tier: 'premium', homeGymId: 'gym-2', joinDate: '2024-06-15', preferredGymId: null, notifications: { classReminders: true, streakAlerts: false } }],
    ['m-3', { id: 'm-3', name: 'Lerato Dlamini', email: 'lerato@example.com', tier: 'basic', homeGymId: 'gym-1', joinDate: '2025-01-10', preferredGymId: null, notifications: { classReminders: false, streakAlerts: false } }],
    ['m-4', { id: 'm-4', name: 'Sipho Ndlovu', email: 'sipho@example.com', tier: 'premium', homeGymId: 'gym-3', joinDate: '2024-11-20', preferredGymId: 'gym-3', notifications: { classReminders: true, streakAlerts: true } }],
    ['m-5', { id: 'm-5', name: 'Aisha Patel', email: 'aisha@example.com', tier: 'elite', homeGymId: 'gym-2', joinDate: '2023-09-05', preferredGymId: 'gym-2', notifications: { classReminders: true, streakAlerts: true } }],
  ]);

  const classes = new Map<string, FitnessClass>([
    ['c-1', { id: 'c-1', gymId: 'gym-1', name: 'Sunrise Yoga', instructor: 'Maya Reed', type: 'yoga', startsAt: daysFromNow(1, 6, 30), capacity: 20, bookedMemberIds: ['m-3'] }],
    ['c-2', { id: 'c-2', gymId: 'gym-1', name: 'HIIT Inferno', instructor: 'Carlos Vega', type: 'hiit', startsAt: daysFromNow(1, 18, 0), capacity: 15, bookedMemberIds: ['m-1', 'm-3'] }],
    ['c-3', { id: 'c-3', gymId: 'gym-1', name: 'Power Spin', instructor: 'Nadia Khan', type: 'spin', startsAt: daysFromNow(2, 7, 0), capacity: 12, bookedMemberIds: [] }],
    ['c-4', { id: 'c-4', gymId: 'gym-2', name: 'Vinyasa Flow', instructor: 'Tom Hardy', type: 'yoga', startsAt: daysFromNow(1, 9, 0), capacity: 18, bookedMemberIds: ['m-5'] }],
    ['c-5', { id: 'c-5', gymId: 'gym-2', name: 'Metcon Madness', instructor: 'Carlos Vega', type: 'hiit', startsAt: daysFromNow(2, 17, 30), capacity: 10, bookedMemberIds: ['m-2', 'm-5'] }],
    ['c-6', { id: 'c-6', gymId: 'gym-2', name: 'Spin Sprint', instructor: 'Nadia Khan', type: 'spin', startsAt: daysFromNow(3, 6, 0), capacity: 14, bookedMemberIds: [] }],
    ['c-7', { id: 'c-7', gymId: 'gym-3', name: 'Restorative Yoga', instructor: 'Maya Reed', type: 'yoga', startsAt: daysFromNow(1, 19, 0), capacity: 16, bookedMemberIds: ['m-4'] }],
    ['c-8', { id: 'c-8', gymId: 'gym-3', name: 'Tabata Blast', instructor: 'Carlos Vega', type: 'hiit', startsAt: daysFromNow(2, 12, 0), capacity: 2, bookedMemberIds: ['m-4', 'm-1'] }],
    ['c-9', { id: 'c-9', gymId: 'gym-3', name: 'Endurance Spin', instructor: 'Nadia Khan', type: 'spin', startsAt: daysFromNow(4, 8, 0), capacity: 12, bookedMemberIds: [] }],
    ['c-10', { id: 'c-10', gymId: 'gym-1', name: 'Candlelight Yoga', instructor: 'Maya Reed', type: 'yoga', startsAt: daysFromNow(3, 20, 0), capacity: 20, bookedMemberIds: [] }],
  ]);

  const checkIns: CheckIn[] = [
    { id: 'ci-1', memberId: 'm-1', gymId: 'gym-1', timestamp: hoursAgo(72) },
    { id: 'ci-2', memberId: 'm-1', gymId: 'gym-1', timestamp: hoursAgo(48) },
    { id: 'ci-3', memberId: 'm-1', gymId: 'gym-2', timestamp: hoursAgo(24) },
    { id: 'ci-4', memberId: 'm-2', gymId: 'gym-2', timestamp: hoursAgo(120) },
    { id: 'ci-5', memberId: 'm-5', gymId: 'gym-2', timestamp: hoursAgo(26) },
    { id: 'ci-6', memberId: 'm-5', gymId: 'gym-2', timestamp: hoursAgo(2) },
  ];

  return { gyms, members, classes, checkIns };
}

export const store: DataStore = createStore();
