import { configDotenv } from 'dotenv';
import { z } from 'zod';
configDotenv({
  path :"./.env.local"
})
const envSchema = z.object({
  NODE_ENV: z.enum([
    'development',
    'production',
    'test'
  ]).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('localhost'),
  LOG_LEVEL: z.enum([
    'fatal',
    'error',
    'warn',
    'info',
    'debug',
    'trace'
  ]).default('info'),
  LOG_PRETTY: z.coerce.boolean().default(true),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW: z.coerce.number().default(60000),
  HEALTH_CHECK_INTERVAL: z.coerce.number().default(30000),

  // Database configuration
  DATABASE_URL: z.string().optional(),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(5432),
  DB_NAME: z.string().default('fastify_app'),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('postgres'),
  DB_SSL: z.coerce.boolean().default(false),
  DB_POOL_MIN: z.coerce.number().default(2),
  DB_POOL_MAX: z.coerce.number().default(10),
  DB_CONNECTION_TIMEOUT: z.coerce.number().default(30000),
  DB_IDLE_TIMEOUT: z.coerce.number().default(30000),

  // Redis configuration (optional)
  ENABLE_REDIS: z.string().optional(),
  REDIS_URL: z.string().optional(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().default(0),
  REDIS_USERNAME: z.string().optional(),
  // API configuration
  API_VERSION: z.string().default('v1'),
  API_PREFIX: z.string().default('/api'),

  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string()
});

export type Config = z.infer<typeof envSchema>;

const parseEnv = (): Config => {
  try {
    
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`Invalid environment variables:\n${errorMessages.join('\n')}`);
    }
    throw error;
  }
};

export const config = parseEnv();

// Utility functions
export const isProduction = () => config.NODE_ENV === 'production';
export const isDevelopment = () => config.NODE_ENV === 'development';
export const isTest = () => config.NODE_ENV === 'test';

// Database connection string builder
export const getDatabaseUrl = (): string => {
  if (config.DATABASE_URL) {
    return config.DATABASE_URL;
  }

  const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = config;
  return `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
};

// Redis connection string builder
export const getRedisUrl = (): string => {
  if (config.REDIS_URL) {
    return config.REDIS_URL;
  }

  const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB } = config;
  const auth = REDIS_PASSWORD ? `:${REDIS_PASSWORD}@` : '';
  return `redis://${auth}${REDIS_HOST}:${REDIS_PORT}/${REDIS_DB}`;
};

export const isRedisEnabled = config.ENABLE_REDIS === 'true';
