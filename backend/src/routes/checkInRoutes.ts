import type { FastifyInstance } from 'fastify';
import { store } from '../stores/dataStore.js';
import { recordCheckIn } from '../services/checkInService.js';

export async function checkInRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    '/api/check-in',
    {
      schema: {
        body: {
          type: 'object',
          additionalProperties: false,
          required: ['memberId', 'gymId'],
          properties: {
            memberId: { type: 'string' },
            gymId: { type: 'string' },
          },
        },
      },
    },
    async (req, reply) => {
      const { memberId, gymId } = req.body as {
        memberId: string;
        gymId: string;
      };
      const checkIn = recordCheckIn(store, memberId, gymId);
      reply.code(201);
      return checkIn;
    },
  );
}
