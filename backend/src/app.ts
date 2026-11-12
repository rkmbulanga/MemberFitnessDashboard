import Fastify, { type FastifyInstance } from 'fastify';
import { AppError } from './services/errors.js';
import { memberRoutes } from './routes/memberRoutes.js';
import { classRoutes } from './routes/classRoutes.js';
import { checkInRoutes } from './routes/checkInRoutes.js';

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: false });

  app.setErrorHandler((error, _req, reply) => {
    if (error instanceof AppError) {
      reply.code(error.statusCode).send({
        error: error.code,
        message: error.message,
        statusCode: error.statusCode,
      });
      return;
    }

    if (error.validation) {
      reply.code(400).send({
        error: 'BAD_REQUEST',
        message: error.message,
        statusCode: 400,
      });
      return;
    }

    reply.code(500).send({
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      statusCode: 500,
    });
  });

  app.get('/health', async () => ({ status: 'ok' }));

  app.register(memberRoutes);
  app.register(classRoutes);
  app.register(checkInRoutes);

  return app;
}
