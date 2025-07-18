import { config } from '@/config/env';
import { registerPlugins } from '@/plugins';
import { logger } from '@/utils/logger';

import dotEnv from 'dotenv';
import Fastify, { FastifyInstance } from 'fastify';

export const createServer = async (): Promise<FastifyInstance> => {
  dotEnv.config();

  // Create logger configuration for Fastify
  const fastifyLoggerConfig = config.NODE_ENV === 'production'
    ? logger
    : {
        level: config.LOG_LEVEL,
        ...(config.LOG_PRETTY && {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname'
            }
          }
        })
      };

  const server = Fastify({
    logger: fastifyLoggerConfig,
    disableRequestLogging: config.NODE_ENV === 'production',
    trustProxy: true,
    bodyLimit: 10 * 1024 * 1024, // 10MB
    keepAliveTimeout: 5000,
    requestTimeout: 30000
  });

  // Register all plugins
  await registerPlugins(server);

  // Health check endpoint
  server.get('/health', {
    schema: {
      description: 'Health check endpoint',
      tags: ['health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            uptime: { type: 'number' },
            version: { type: 'string' },
            environment: { type: 'string' }
          }
        }
      }
    }
  }, async (_request, _reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version ?? '1.0.0',
      environment: config.NODE_ENV
    };
  });

  // Ready check endpoint
  server.get('/ready', {
    schema: {
      description: 'Readiness check endpoint',
      tags: ['health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' }
          }
        }
      }
    }
  }, async (_request, _reply) => {
    // Add your readiness checks here (database connection, external services, etc.)
    return {
      status: 'ready',
      timestamp: new Date().toISOString()
    };
  });

  // Add a catch-all route for undefined routes
  server.setNotFoundHandler(async (request, reply) => {
    return reply.code(404).send({
      error: 'Not Found',
      message: `Route ${request.method}:${request.url} not found`,
      statusCode: 404
    });
  });

  return server;
};
