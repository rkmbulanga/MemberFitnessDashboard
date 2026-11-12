export type MembershipTier = 'basic' | 'premium' | 'elite';

export type ClassType = 'yoga' | 'hiit' | 'spin';

export interface Gym {
  id: string;
  name: string;
  city: string;
}

export interface NotificationSettings {
  classReminders: boolean;
  streakAlerts: boolean;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  tier: MembershipTier;
  homeGymId: string;
  joinDate: string;
  preferredGymId: string | null;
  notifications: NotificationSettings;
}

export interface FitnessClass {
  id: string;
  gymId: string;
  name: string;
  instructor: string;
  type: ClassType;
  startsAt: string;
  capacity: number;
  bookedMemberIds: string[];
}

export interface CheckIn {
  id: string;
  memberId: string;
  gymId: string;
  timestamp: string;
}

export interface Booking {
  classId: string;
  memberId: string;
  bookedAt: string;
}

export interface MemberStats {
  totalVisits: number;
  currentStreak: number;
  favoriteGymId: string | null;
  classesAttended: number;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
