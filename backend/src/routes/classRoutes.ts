import type { FastifyInstance } from 'fastify';
import { store } from '../stores/dataStore.js';
import type { ClassType } from '../types/index.js';
import {
  listClasses,
  bookClass,
  cancelBooking,
} from '../services/classService.js';

export async function classRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/api/gyms/:gymId/classes',
    {
      schema: {
        params: {
          type: 'object',
          required: ['gymId'],
          properties: { gymId: { type: 'string' } },
        },
        querystring: {
          type: 'object',
          properties: {
            date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
            type: { type: 'string', enum: ['yoga', 'hiit', 'spin'] },
          },
        },
      },
    },
    async (req) => {
      const { gymId } = req.params as { gymId: string };
      const { date, type } = req.query as { date?: string; type?: ClassType };
      return listClasses(store, gymId, { date, type });
    },
  );

  app.post(
    '/api/classes/:classId/book',
    {
      schema: {
        params: {
          type: 'object',
          required: ['classId'],
          properties: { classId: { type: 'string' } },
        },
        body: {
          type: 'object',
          additionalProperties: false,
          required: ['memberId'],
          properties: { memberId: { type: 'string' } },
        },
      },
    },
    async (req, reply) => {
      const { classId } = req.params as { classId: string };
      const { memberId } = req.body as { memberId: string };
      const cls = bookClass(store, classId, memberId);
      reply.code(201);
      return cls;
    },
  );

  app.delete(
    '/api/classes/:classId/book/:memberId',
    {
      schema: {
        params: {
          type: 'object',
          required: ['classId', 'memberId'],
          properties: {
            classId: { type: 'string' },
            memberId: { type: 'string' },
          },
        },
      },
    },
    async (req) => {
      const { classId, memberId } = req.params as {
        classId: string;
        memberId: string;
      };
      return cancelBooking(store, classId, memberId);
    },
  );
}
