import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { logger } from '@/utils/logger';
import { db, DrizzleDatabase, pool } from '@/db';

declare module 'fastify' {
  interface FastifyInstance {
    db: DrizzleDatabase
  }
  interface FastifyRequest{
    db : DrizzleDatabase
   
  }
}

const dbPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {

  // Decorate fastify instance
  fastify.decorate('db', db);
  fastify.decorateRequest('db', db);

  // Close pool when server closes
  fastify.addHook('onClose', async () => {
    await pool.end();
    logger.info('Database connection closed');
  });
};

export default fp(dbPlugin, {
  name: 'database',
});