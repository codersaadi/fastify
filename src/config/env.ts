import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('localhost'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  LOG_PRETTY: z.coerce.boolean().default(true),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW: z.coerce.number().default(60000),
  HEALTH_CHECK_INTERVAL: z.coerce.number().default(30000),
});

export type Config = z.infer<typeof envSchema>;

const parseEnv = (): Config => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      );
      throw new Error(`Invalid environment variables:\n${errorMessages.join('\n')}`);
    }
    throw error;
  }
};

export const config = parseEnv();

// Utility function to check if we're in production
export const isProduction = () => config.NODE_ENV === 'production';

// Utility function to check if we're in development
export const isDevelopment = () => config.NODE_ENV === 'development';

// Utility function to check if we're in test
export const isTest = () => config.NODE_ENV === 'test';