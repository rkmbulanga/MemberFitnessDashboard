import type { FastifyInstance } from 'fastify';
import { store } from '../stores/dataStore.js';
import {
  getMember,
  getMemberStats,
  updatePreferences,
} from '../services/memberService.js';
import { getCheckInHistory } from '../services/checkInService.js';
import { listMemberBookings } from '../services/classService.js';

const idParams = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'string' } },
} as const;

const preferencesBody = {
  type: 'object',
  additionalProperties: false,
  properties: {
    preferredGymId: { type: 'string' },
    notifications: {
      type: 'object',
      additionalProperties: false,
      required: ['classReminders', 'streakAlerts'],
      properties: {
        classReminders: { type: 'boolean' },
        streakAlerts: { type: 'boolean' },
      },
    },
  },
} as const;

export async function memberRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/members/:id', { schema: { params: idParams } }, async (req) => {
    const { id } = req.params as { id: string };
    return getMember(store, id);
  });

  app.get(
    '/api/members/:id/stats',
    { schema: { params: idParams } },
    async (req) => {
      const { id } = req.params as { id: string };
      return getMemberStats(store, id);
    },
  );

  app.put(
    '/api/members/:id/preferences',
    { schema: { params: idParams, body: preferencesBody } },
    async (req) => {
      const { id } = req.params as { id: string };
      const body = req.body as {
        preferredGymId?: string;
        notifications?: { classReminders: boolean; streakAlerts: boolean };
      };
      return updatePreferences(store, id, body);
    },
  );

  app.get(
    '/api/members/:id/check-ins',
    { schema: { params: idParams } },
    async (req) => {
      const { id } = req.params as { id: string };
      return getCheckInHistory(store, id);
    },
  );

  app.get(
    '/api/members/:id/bookings',
    { schema: { params: idParams } },
    async (req) => {
      const { id } = req.params as { id: string };
      return listMemberBookings(store, id);
    },
  );
}
