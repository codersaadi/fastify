import { config, getDatabaseUrl } from '@/config/env';

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import * as schema from './schema';

export const pool = new Pool({
  connectionString: getDatabaseUrl(),
  ssl: config.DB_SSL ? { rejectUnauthorized: false } : false,
  min: config.DB_POOL_MIN,
  max: config.DB_POOL_MAX,
  connectionTimeoutMillis: config.DB_CONNECTION_TIMEOUT,
  idleTimeoutMillis: config.DB_IDLE_TIMEOUT
});

export const db = drizzle({ client: pool, schema });
export type DrizzleDatabase = typeof db;
