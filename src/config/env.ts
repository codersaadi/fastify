import { createEnv } from '@t3-oss/env-core';
import { configDotenv } from 'dotenv';
import { z } from 'zod';
configDotenv({
  path : ['.env', '.env.development', '.env.test', '.env.production', '.env.local']
})
export const env = createEnv({
  /**
   * Server-side environment variables, not available on the client.
   * Will throw if you access these variables on the client.
   */
  server: {
    // Server configuration
    NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),
    PORT: z.coerce.number().min(1).max(65535).default(3000),
    HOST: z.string().min(1).default('localhost'),

    // Logging configuration
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    LOG_PRETTY: z.coerce.boolean().default(true),

    // Security & CORS
    CORS_ORIGIN: z.string().url().default('http://localhost:3000'),
    TRUSTED_ORIGINS: z.string().optional(),

    // Rate limiting
    RATE_LIMIT_MAX: z.coerce.number().positive().default(100),
    RATE_LIMIT_WINDOW: z.coerce.number().positive().default(60000),

    // Health checks
    HEALTH_CHECK_INTERVAL: z.coerce.number().positive().default(30000),

    // Database configuration
    DATABASE_URL: z.string().url().optional(),
    DB_HOST: z.string().min(1).default('localhost'),
    DB_PORT: z.coerce.number().min(1).max(65535).default(5432),
    DB_NAME: z.string().min(1).default('fastify_app'),
    DB_USER: z.string().min(1).default('postgres'),
    DB_PASSWORD: z.string().min(1).default('postgres'),
    DB_SSL: z.coerce.boolean().default(false),
    DB_POOL_MIN: z.coerce.number().min(0).default(2),
    DB_POOL_MAX: z.coerce.number().min(1).default(10),
    DB_CONNECTION_TIMEOUT: z.coerce.number().positive().default(30000),
    DB_IDLE_TIMEOUT: z.coerce.number().positive().default(30000),

    // Redis configuration
    ENABLE_REDIS: z.coerce.boolean().default(false),
    REDIS_URL: z.string().url().optional(),
    REDIS_HOST: z.string().min(1).default('localhost'),
    REDIS_PORT: z.coerce.number().min(1).max(65535).default(6379),
    REDIS_PASSWORD: z.string().optional(),
    REDIS_DB: z.coerce.number().min(0).default(0),
    REDIS_USERNAME: z.string().optional(),

    // API configuration
    API_VERSION: z.string().regex(/^v\d+$/).default('v1'),
    API_PREFIX: z.string().regex(/^\//).default('/api'),

    // Auth configuration
    BETTER_AUTH_SECRET: z.string().min(32, 'Auth secret must be at least 32 characters'),
    BETTER_AUTH_URL: z.string().url(),

    // OAuth providers - Google
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),

    // OAuth providers - GitHub
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),

    // OAuth providers - Facebook
    FACEBOOK_CLIENT_ID: z.string().optional(),
    FACEBOOK_CLIENT_SECRET: z.string().optional(),

    // OAuth providers - Apple
    APPLE_CLIENT_ID: z.string().optional(),
    APPLE_CLIENT_SECRET: z.string().optional(),

    // OAuth providers - Discord
    DISCORD_CLIENT_ID: z.string().optional(),
    DISCORD_CLIENT_SECRET: z.string().optional(),

    // OAuth providers - Twitter
    TWITTER_CLIENT_ID: z.string().optional(),
    TWITTER_CLIENT_SECRET: z.string().optional(),

    // OAuth providers - Zoom
    ZOOM_CLIENT_ID: z.string().optional(),
    ZOOM_CLIENT_SECRET: z.string().optional(),

    // OAuth providers - Twitch
    TWITCH_CLIENT_ID: z.string().optional(),
    TWITCH_CLIENT_SECRET: z.string().optional(),

    // OAuth providers - TikTok
    TIKTOK_CLIENT_ID: z.string().optional(),
    TIKTOK_CLIENT_SECRET: z.string().optional(),
    TIKTOK_CLIENT_KEY: z.string().optional(),

    // OAuth providers - Reddit
    REDDIT_CLIENT_ID: z.string().optional(),
    REDDIT_CLIENT_SECRET: z.string().optional(),

    // OAuth providers - Microsoft
    MICROSOFT_CLIENT_ID: z.string().optional(),
    MICROSOFT_CLIENT_SECRET: z.string().optional(),

    // OAuth providers - LinkedIn
    LINKEDIN_CLIENT_ID: z.string().optional(),
    LINKEDIN_CLIENT_SECRET: z.string().optional(),

    // OAuth providers - Kick
    KICK_CLIENT_ID: z.string().optional(),
    KICK_CLIENT_SECRET: z.string().optional(),

    // OAuth providers - GitLab
    GITLAB_CLIENT_ID: z.string().optional(),
    GITLAB_CLIENT_SECRET: z.string().optional(),
    GITLAB_ISSUER: z.string().optional(),

    // OAuth providers - Dropbox
    DROPBOX_CLIENT_ID: z.string().optional(),
    DROPBOX_CLIENT_SECRET: z.string().optional(),

    // OAuth providers - Hugging Face
    HUGGING_FACE_CLIENT_ID: z.string().optional(),
    HUGGING_FACE_CLIENT_SECRET: z.string().optional(),

    // OAuth providers - Spotify
    SPOTIFY_CLIENT_ID: z.string().optional(),
    SPOTIFY_CLIENT_SECRET: z.string().optional(),

    // Auth features
    AUTH_PROVIDERS: z.string().optional(),
    ENABLE_EMAIL_PASSWORD: z.coerce.boolean().default(false),
    DISABLE_SIGNUP: z.coerce.boolean().default(false),

    // WebSocket
    ENABLE_WEBSOCKET: z.coerce.boolean().default(false),
  },

  /**
   * Client-side environment variables, exposed to the client.
   * These will be validated at build time and available at runtime.
   */
  client: {
    // Add any client-side env vars here if needed
    // NEXT_PUBLIC_APP_URL: z.string().url(),
  },

  /**
   * Environment variables available on both client and server.
   * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
   */
  shared: {
    NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
  },

  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: 'NEXT_PUBLIC_',

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: process.env,

  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,

  /**
   * Called when the schema validation fails.
   */
  onValidationError: (issues) => {
    console.error(
      '❌ Invalid environment variables:',
      issues,
    );
    throw new Error('Invalid environment variables');
  },

  /**
   * Called when a server-side environment variable is accessed on the client.
   */
  onInvalidAccess: (variable: string) => {
    throw new Error(
      `❌ Attempted to access a server-side environment variable on the client: ${variable}`,
    );
  },
});

// Enhanced utility functions with better type safety
export const isProduction = (): boolean => env.NODE_ENV === 'production';
export const isDevelopment = (): boolean => env.NODE_ENV === 'development';
export const isTest = (): boolean => env.NODE_ENV === 'test';

// Database connection utilities
export const getDatabaseUrl = (): string => {
  if (env.DATABASE_URL) {
    return env.DATABASE_URL;
  }

  const sslParam = env.DB_SSL ? '?sslmode=require' : '';
  return `postgresql://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}${sslParam}`;
};

// Redis connection utilities
export const getRedisUrl = (): string => {
  if (env.REDIS_URL) {
    return env.REDIS_URL;
  }

  let auth = '';
  if (env.REDIS_USERNAME && env.REDIS_PASSWORD) {
    auth = `${env.REDIS_USERNAME}:${env.REDIS_PASSWORD}@`;
  } else if (env.REDIS_PASSWORD) {
    auth = `:${env.REDIS_PASSWORD}@`;
  }

  return `redis://${auth}${env.REDIS_HOST}:${env.REDIS_PORT}/${env.REDIS_DB}`;
};

// Configuration objects for different services
export const getDatabaseConfig = () => ({
  url: getDatabaseUrl(),
  ssl: env.DB_SSL,
  pool: {
    min: env.DB_POOL_MIN,
    max: env.DB_POOL_MAX,
  },
  connection: {
    connectionTimeoutMillis: env.DB_CONNECTION_TIMEOUT,
    idleTimeoutMillis: env.DB_IDLE_TIMEOUT,
  },
});

export const getRedisConfig = () => ({
  url: getRedisUrl(),
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  db: env.REDIS_DB,
  username: env.REDIS_USERNAME,
});

export const getServerConfig = () => ({
  host: env.HOST,
  port: env.PORT,
  cors: {
    origin: getAllTrustedOrigins(),
    credentials: true,
  },
  rateLimit: {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW,
  },
  logger: {
    level: env.LOG_LEVEL,
    transport: isDevelopment() && env.LOG_PRETTY
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  },
});

export const getApiConfig = () => ({
  version: env.API_VERSION,
  prefix: env.API_PREFIX,
  healthCheck: {
    interval: env.HEALTH_CHECK_INTERVAL,
  },
});

// Enhanced trusted origins handling
export const getTrustedOriginsFromEnv = (): string[] => {
  if (!env.TRUSTED_ORIGINS) {
    return [];
  }

  return env.TRUSTED_ORIGINS
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => {
      if (!origin) return false;
      
      try {
        new URL(origin);
        return true;
      } catch {
        console.warn(`⚠️  Invalid URL in TRUSTED_ORIGINS: ${origin}`);
        return false;
      }
    });
};

export const getAllTrustedOrigins = (): string[] => {
  const origins = new Set<string>();

  // Add primary CORS origin
  origins.add(env.CORS_ORIGIN);

  // Add auth URL if configured
  if (env.BETTER_AUTH_URL) {
    try {
      const authUrl = new URL(env.BETTER_AUTH_URL);
      origins.add(`${authUrl.protocol}//${authUrl.host}`);
    } catch {
      console.warn('⚠️  Invalid BETTER_AUTH_URL format');
    }
  }

  // Add additional trusted origins
  getTrustedOriginsFromEnv().forEach((origin) => origins.add(origin));

  return Array.from(origins);
};

// OAuth provider validation and utilities
export const getConfiguredOAuthProviders = (): string[] => {
  if (!env.AUTH_PROVIDERS) return [];

  const providers = env.AUTH_PROVIDERS
    .split(',')
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);

  // Validate that each provider has required credentials
  return providers.filter((provider) => {
    const clientIdKey = `${provider.toUpperCase()}_CLIENT_ID` as keyof typeof env;
    const clientSecretKey = `${provider.toUpperCase()}_CLIENT_SECRET` as keyof typeof env;

    const hasCredentials = env[clientIdKey] && env[clientSecretKey];
    
    if (!hasCredentials) {
      console.warn(`⚠️  OAuth provider "${provider}" is configured but missing credentials`);
      return false;
    }

    return true;
  });
};

// Feature flags
export const isRedisEnabled = (): boolean => env.ENABLE_REDIS;
export const isWebSocketEnabled = (): boolean => env.ENABLE_WEBSOCKET;
export const isEmailPasswordEnabled = (): boolean => env.ENABLE_EMAIL_PASSWORD;
export const isSignupDisabled = (): boolean => env.DISABLE_SIGNUP;

// Type exports for better TypeScript integration
export type EnvConfig = typeof env;