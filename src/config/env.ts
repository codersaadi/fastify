// src/config/env.ts
import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables
config({ path: './.env.local' });

const envSchema = z.object({
  // Server configuration
  NODE_ENV: z.enum([
    'development',
    'production',
    'test'
  ]).default('development'),
  PORT: z.coerce.number().min(1)
    .max(65535)
    .default(3000),
  HOST: z.string().min(1)
    .default('localhost'),

  // Logging configuration
  LOG_LEVEL: z.enum([
    'fatal',
    'error',
    'warn',
    'info',
    'debug',
    'trace'
  ]).default('info'),
  LOG_PRETTY: z.coerce.boolean().default(true),

  // Security & CORS
  CORS_ORIGIN: z.string().url()
    .default('http://localhost:3000'),
  RATE_LIMIT_MAX: z.coerce.number().positive()
    .default(100),
  RATE_LIMIT_WINDOW: z.coerce.number().positive()
    .default(60000),

  // Health checks
  HEALTH_CHECK_INTERVAL: z.coerce.number().positive()
    .default(30000),

  // Database configuration
  DATABASE_URL: z.string().url()
    .optional(),
  DB_HOST: z.string().min(1)
    .default('localhost'),
  DB_PORT: z.coerce.number().min(1)
    .max(65535)
    .default(5432),
  DB_NAME: z.string().min(1)
    .default('fastify_app'),
  DB_USER: z.string().min(1)
    .default('postgres'),
  DB_PASSWORD: z.string().min(1)
    .default('postgres'),
  DB_SSL: z.coerce.boolean().default(false),
  DB_POOL_MIN: z.coerce.number().min(0)
    .default(2),
  DB_POOL_MAX: z.coerce.number().min(1)
    .default(10),
  DB_CONNECTION_TIMEOUT: z.coerce.number().positive()
    .default(30000),
  DB_IDLE_TIMEOUT: z.coerce.number().positive()
    .default(30000),

  // Redis configuration
  ENABLE_REDIS: z.coerce.boolean().default(false),
  REDIS_URL: z.string().url()
    .optional(),
  REDIS_HOST: z.string().min(1)
    .default('localhost'),
  REDIS_PORT: z.coerce.number().min(1)
    .max(65535)
    .default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().min(0)
    .default(0),
  REDIS_USERNAME: z.string().optional(),

  // API configuration
  API_VERSION: z.string().regex(/^v\d+$/)
    .default('v1'),
  API_PREFIX: z.string().regex(/^\//)
    .default('/api'),

  // Auth configuration
  BETTER_AUTH_SECRET: z.string().min(32, 'Auth secret must be at least 32 characters'),
  BETTER_AUTH_URL: z.string().url(),
  AUTH_PROVIDERS: z.string().optional(),

  // OAuth providers
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_CLIENT_ID: z.string().optional(),
  FACEBOOK_CLIENT_SECRET: z.string().optional(),
  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_CLIENT_SECRET: z.string().optional(),
  DISCORD_CLIENT_ID: z.string().optional(),
  DISCORD_CLIENT_SECRET: z.string().optional(),
  TWITTER_CLIENT_ID: z.string().optional(),
  TWITTER_CLIENT_SECRET: z.string().optional(),

  ZOOM_CLIENT_ID: z.string().optional(),
  ZOOM_CLIENT_SECRET: z.string().optional(),

  TWITCH_CLIENT_ID: z.string().optional(),
  TWITCH_CLIENT_SECRET: z.string().optional(),

  TIKTOK_CLIENT_ID: z.string().optional(),
  TIKTOK_CLIENT_SECRET: z.string().optional(),
  TIKTOK_CLIENT_KEY : z.string().optional(),

  REDDIT_CLIENT_ID: z.string().optional(),
  REDDIT_CLIENT_SECRET: z.string().optional(),

  MICROSOFT_CLIENT_ID: z.string().optional(),
  MICROSOFT_CLIENT_SECRET: z.string().optional(),

  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),

  KICK_CLIENT_ID: z.string().optional(),
  KICK_CLIENT_SECRET: z.string().optional(),

  GITLAB_CLIENT_ID: z.string().optional(),
  GITLAB_CLIENT_SECRET: z.string().optional(),
  GITLAB_ISSUER : z.string().optional(),

  DROPBOX_CLIENT_ID: z.string().optional(),
  DROPBOX_CLIENT_SECRET: z.string().optional(),

  HUGGING_FACE_CLIENT_ID: z.string().optional(),
  HUGGING_FACE_CLIENT_SECRET: z.string().optional(),

  ENABLE_EMAIL_PASSWORD : z.string().optional().default("false"),
  DISABLE_SIGNUP : z.string().optional().default("false"),

  SPOTIFY_CLIENT_SECRET: z.string().optional(),
  SPOTIFY_CLIENT_ID : z.string().optional()
});

export type EnvConfig = z.infer<typeof envSchema>;

class ConfigurationError extends Error {
  constructor (message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

const parseEnv = (): EnvConfig => {
  try {
    const parsed = envSchema.parse(process.env);

    // Additional validation for auth providers
    if (parsed.AUTH_PROVIDERS) {
      const providers = parsed.AUTH_PROVIDERS.split(',').map((p) => p.trim().toLowerCase());

      for (const provider of providers) {
        const clientIdKey = `${provider.toUpperCase()}_CLIENT_ID` as keyof EnvConfig;
        const clientSecretKey = `${provider.toUpperCase()}_CLIENT_SECRET` as keyof EnvConfig;

        if (!parsed[clientIdKey] || !parsed[clientSecretKey]) {
          throw new ConfigurationError(`Missing credentials for ${provider} provider. Required: ${clientIdKey} and ${clientSecretKey}`);
        }
      }
    }

    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      throw new ConfigurationError(`Invalid environment variables:\n${errorMessages.join('\n')}`);
    }
    if (error instanceof ConfigurationError) {
      throw error;
    }
    throw new ConfigurationError(`Failed to parse environment variables: ${error}`);
  }
};

export const env = parseEnv();

// Utility functions
export const isProduction = (): boolean => env.NODE_ENV === 'production';
export const isDevelopment = (): boolean => env.NODE_ENV === 'development';
export const isTest = (): boolean => env.NODE_ENV === 'test';

// Database connection string builder
export const getDatabaseUrl = (): string => {
  if (env.DATABASE_URL) {
    return env.DATABASE_URL;
  }

  const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, DB_SSL } = env;
  const sslParam = DB_SSL ? '?sslmode=require' : '';
  return `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}${sslParam}`;
};

// Redis connection string builder
export const getRedisUrl = (): string => {
  if (env.REDIS_URL) {
    return env.REDIS_URL;
  }

  const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB, REDIS_USERNAME } = env;

  let auth = '';
  if (REDIS_USERNAME && REDIS_PASSWORD) {
    auth = `${REDIS_USERNAME}:${REDIS_PASSWORD}@`;
  } else if (REDIS_PASSWORD) {
    auth = `:${REDIS_PASSWORD}@`;
  }

  return `redis://${auth}${REDIS_HOST}:${REDIS_PORT}/${REDIS_DB}`;
};

export const isRedisEnabled = (): boolean => env.ENABLE_REDIS;

// Database configuration object
export const getDatabaseConfig = () => ({
  url: getDatabaseUrl(),
  ssl: env.DB_SSL,
  pool: {
    min: env.DB_POOL_MIN,
    max: env.DB_POOL_MAX
  },
  connection: {
    connectionTimeoutMillis: env.DB_CONNECTION_TIMEOUT,
    idleTimeoutMillis: env.DB_IDLE_TIMEOUT
  }
});

// Redis configuration object
export const getRedisConfig = () => ({
  url: getRedisUrl(),
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  db: env.REDIS_DB,
  username: env.REDIS_USERNAME
});

// Server configuration object
export const getServerConfig = () => ({
  host: env.HOST,
  port: env.PORT,
  cors: {
    origin: env.CORS_ORIGIN
  },
  rateLimit: {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW
  },
  logger: {
    level: env.LOG_LEVEL,
    prettyPrint: env.LOG_PRETTY && isDevelopment()
  }
});

// API configuration
export const getApiConfig = () => ({
  version: env.API_VERSION,
  prefix: env.API_PREFIX,
  healthCheck: {
    interval: env.HEALTH_CHECK_INTERVAL
  }
});
