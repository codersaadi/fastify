import { isWebSocketEnabled } from '@/config/env';

import { fastifyTRPCPlugin, FastifyTRPCPluginOptions } from '@trpc/server/adapters/fastify';
import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

import { AppRouter, appRouter } from './router';
import { createTRPCContext } from './trpc';
const trpcPrefix: string = '/api/trpc';

const trpcPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
const isWebSocket = isWebSocketEnabled()
  await fastify.register(fastifyTRPCPlugin, {
    useWSS: isWebSocket,
    keepAlive: isWebSocket
      ? {
          enabled: true,
          pingMs: 30000, // server ping message interval in milliseconds
          pongWaitMs: 5000// connection is terminated if pong message is not received in this many milliseconds
        }
      : undefined,
    prefix: trpcPrefix,
    trpcOptions: {
      router: appRouter,
      createContext: createTRPCContext,
      onError: ({ path, error, type, ctx }) => {
        // Enhanced error logging
        const errorInfo = {
          path,
          type,
          code: error.code,
          message: error.message,
          userId: ctx?.auth?.user.id || 'anonymous'
          // ip: ctx?.ip || 'unknown',
          // userAgent: ctx?.userAgent || 'unknown',
        };

        if (error.code === 'INTERNAL_SERVER_ERROR') {
          fastify.log.error(errorInfo, 'tRPC Internal Server Error');
        } else if (error.code === 'UNAUTHORIZED') {
          fastify.log.warn(errorInfo, 'tRPC Unauthorized Access');
        } else {
          fastify.log.debug(errorInfo, 'tRPC Error');
        }

        // Don't expose internal errors in production
        if (process.env.NODE_ENV === 'production' && error.code === 'INTERNAL_SERVER_ERROR') {
          throw new Error('Internal Server Error');
        }
      }

    } satisfies FastifyTRPCPluginOptions<AppRouter>['trpcOptions']

  });

  // Add tRPC to Swagger documentation
  fastify.addHook('onReady', async () => {
    fastify.log.info(`🚀 tRPC server ready at ${trpcPrefix}`);
  });
};

export default fp(trpcPlugin, {
  name: 'trpc'
});
