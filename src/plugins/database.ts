import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { Pool, PoolClient } from 'pg';
import { config, getDatabaseUrl } from '@/config/env';
import { logger } from '@/utils/logger';

declare module 'fastify' {
  interface FastifyInstance {
    db: {
      pool: Pool;
      query: <T = any>(text: string, params?: any[]) => Promise<T[]>;
      getClient: () => Promise<PoolClient>;
    };
  }
}

const dbPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const pool = new Pool({
    connectionString: getDatabaseUrl(),
    ssl: config.DB_SSL ? { rejectUnauthorized: false } : false,
    min: config.DB_POOL_MIN,
    max: config.DB_POOL_MAX,
    connectionTimeoutMillis: config.DB_CONNECTION_TIMEOUT,
    idleTimeoutMillis: config.DB_IDLE_TIMEOUT,
  });

  // Test connection
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }

  // Helper function to execute queries
  const query = async <T = any>(text: string, params?: any[]): Promise<T[]> => {
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      return result.rows;
    } finally {
      client.release();
    }
  };

  // Helper function to get a client for transactions
  const getClient = async (): Promise<PoolClient> => {
    return await pool.connect();
  };

  // Decorate fastify instance
  fastify.decorate('db', {
    pool,
    query,
    getClient,
  });

  // Close pool when server closes
  fastify.addHook('onClose', async () => {
    await pool.end();
    logger.info('Database connection closed');
  });
};

export default fp(dbPlugin, {
  name: 'database',
});