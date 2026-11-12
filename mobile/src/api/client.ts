import Constants from 'expo-constants';
import type {
  Member,
  MemberStats,
  FitnessClass,
  Booking,
  CheckIn,
  ClassType,
} from '../types/index';

const BASE_URL =
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ??
  'http://localhost:3000';

export class ApiError extends Error {
  public readonly statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message =
      data && typeof data.message === 'string'
        ? data.message
        : `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message);
  }
  return data as T;
}

export const api = {
  getMember: (id: string): Promise<Member> =>
    request<Member>(`/api/members/${id}`),

  getStats: (id: string): Promise<MemberStats> =>
    request<MemberStats>(`/api/members/${id}/stats`),

  getBookings: (id: string): Promise<Booking[]> =>
    request<Booking[]>(`/api/members/${id}/bookings`),

  listClasses: (
    gymId: string,
    filter?: { date?: string; type?: ClassType },
  ): Promise<FitnessClass[]> => {
    const params = new URLSearchParams();
    if (filter?.date) params.set('date', filter.date);
    if (filter?.type) params.set('type', filter.type);
    const qs = params.toString();
    return request<FitnessClass[]>(
      `/api/gyms/${gymId}/classes${qs ? `?${qs}` : ''}`,
    );
  },

  bookClass: (classId: string, memberId: string): Promise<FitnessClass> =>
    request<FitnessClass>(`/api/classes/${classId}/book`, {
      method: 'POST',
      body: JSON.stringify({ memberId }),
    }),

  cancelBooking: (classId: string, memberId: string): Promise<FitnessClass> =>
    request<FitnessClass>(`/api/classes/${classId}/book/${memberId}`, {
      method: 'DELETE',
    }),

  checkIn: (memberId: string, gymId: string): Promise<CheckIn> =>
    request<CheckIn>(`/api/check-in`, {
      method: 'POST',
      body: JSON.stringify({ memberId, gymId }),
    }),
};
