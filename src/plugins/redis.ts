import { getRedisUrl } from '@/config/env';
import { logger } from '@/utils/logger';

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import Redis from 'ioredis';

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis;
  }
}

const redisPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const redis = new Redis(getRedisUrl());
  // todo : add these
  // retryDelayOnFailover: 100,
  // enableReadyCheck: false,
  // maxRetriesPerRequest: 3,

  // Test connection
  try {
    await redis.ping();
    logger.info('Redis connected successfully');
  } catch (error) {
    logger.error('Redis connection failed:', error);
    throw error;
  }

  // Decorate fastify instance
  fastify.decorate('redis', redis);

  // Close connection when server closes
  fastify.addHook('onClose', async () => {
    await redis.quit();
    logger.info('Redis connection closed');
  });
};

export default fp(redisPlugin, {
  name: 'redis'
});
