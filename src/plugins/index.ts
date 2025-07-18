import { env, isRedisEnabled } from '@/config/env';
import authHook from '@/hooks/auth.hook';

import ws from '@fastify/websocket';
import { FastifyInstance } from 'fastify';

import authPlugin from './auth';
import databasePlugin from './database';
import multipart from './multipart';
import trpcPlugin from './trpc/trpc.plugin';
export const registerPlugins = async (server: FastifyInstance) => {
  // Register sensible defaults
  await server.register(import('@fastify/sensible'));

  // Register helmet for security headers
  await server.register(import('@fastify/helmet'), {
    global: true,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: [
          "'self'",
          'data:',
          'https:'
        ]
      }
    }
  });

  // Register CORS
  await server.register(import('@fastify/cors'), {
    origin: env.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
    credentials: true,
    methods: [
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'OPTIONS',
      'PATCH'
    ],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With'
    ]
  });

  // // Register compression (throws error with trpc)
  // https://github.com/fastify/fastify-compress/issues/309
  // https://github.com/trpc/trpc/issues/6628
  // needs attention
  // await server.register(import('@fastify/compress'), {
  //   global: true,
  //   threshold: 1024,
  //   encodings: ['gzip', 'deflate']
  // });

  // Register rate limiting
  await server.register(import('@fastify/rate-limit'), {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW,
    errorResponseBuilder: (_request, context) => {
      return {
        error: 'Too Many Requests',
        message: `Rate limit exceeded, retry in ${Math.round(context.ttl / 1000)} seconds`,
        statusCode: 429,
        ttl: context.ttl
      };
    }
  });

  // Register under pressure for monitoring
  // const underPressure = await import('@fastify/under-pressure');
  // await server.register(underPressure.default, {
  //   maxEventLoopDelay: 1000,
  //   maxHeapUsedBytes: 100000000,
  //   maxRssBytes: 100000000,
  //   maxEventLoopUtilization: 0.98,
  //   message: 'Under pressure!',
  //   retryAfter: 50,
  //   pressureHandler: (_req, rep, type, value) => {
  //     server.log.warn(`Server under pressure: ${type} = ${value}`);
  //     rep.send('Server under pressure');
  //   }
  // });

  // Database and Redis plugins
  await server.register(databasePlugin);

  if (isRedisEnabled()) {
    await server.register(import('./redis'));
  }
  await server.register(multipart);
  await server.register(authPlugin);
  // Register auth hook
  await authHook(server);
  await server.register(ws);

  await server.register(trpcPlugin);
  // Register Swagger documentation
  await server.register(import('@fastify/swagger'), {
    swagger: {
      info: {
        title: 'Fastify API',
        description: 'Production-ready Fastify API with TypeScript',
        version: '1.0.0'
      },
      host: `${env.HOST}:${env.PORT}`,
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [{ name: 'health', description: 'Health check endpoints' }],
      securityDefinitions: {
        Bearer: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
          description: 'Bearer token authentication'
        }
      }
    }
  });

  // Register Swagger UI
  await server.register(import('@fastify/swagger-ui'), {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    },
    uiHooks: {
      onRequest: function (_request, _reply, next) {
        next();
      },
      preHandler: function (_request, _reply, next) {
        next();
      }
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject) => {
      return swaggerObject;
    },
    transformSpecificationClone: true
  });

  // Register environment configuration
  await server.register(import('@fastify/env'), {
    confKey: 'config',
    schema: {
      type: 'object',
      properties: {
        NODE_ENV: { type: 'string' },
        PORT: { type: 'number' },
        HOST: { type: 'string' }
      }
    },
    data: env
  });
};
