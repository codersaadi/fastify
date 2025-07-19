import { env, getTrustedOriginsFromEnv } from '@/config/env';

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { authPlugins } from './plugins';
import { getAuthProviders, isProviderEnabled } from './providers';

import { db } from '../db/index';

/**
 * Enhanced Better Auth configuration with comprehensive feature support
 * and environment-based conditional loading.
 */
export const authConfig = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true,
    schema: {
      user: 'auth_users',
      session: 'auth_sessions',
      account: 'auth_accounts',
      verification: 'auth_verifications'
    }
  }),

  plugins: authPlugins,

  // Enhanced session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 1 week
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 // 5 minutes
    },
    freshAge: 60 * 15 // Consider session "fresh" for 15 minutes
  },

  // Email and password authentication (conditional)
  ...(env.ENABLE_EMAIL_PASSWORD && {
    emailAndPassword: {
      enabled: true,
      disableSignUp: env.DISABLE_SIGNUP,
      requireEmailVerification: env.REQUIRE_EMAIL_VERIFICATION,
      minPasswordLength: env.MIN_PASSWORD_LENGTH,
      maxPasswordLength: env.MAX_PASSWORD_LENGTH,
      async sendResetPassword (data, _request) {
        console.log(`Sending password reset to ${data.user.email}: ${data.url}`);
        // TODO: Implement email service integration
        // await sendPasswordResetEmail(data.user.email, data.url);
      }
    }
  }),

  // Social providers configuration
  socialProviders: getAuthProviders(),

  // Advanced configuration
  advanced: {
    cookiePrefix: env.COOKIE_PREFIX,
    crossSubDomainCookies: {
      enabled: env.ENABLE_CROSS_SUBDOMAIN_COOKIES,
      ...(env.COOKIE_DOMAIN && { domain: env.COOKIE_DOMAIN })
    },
    database: {
      generateId: false
    }
  },

  // Comprehensive trusted origins configuration
  trustedOrigins: buildTrustedOrigins(),

  // Base URL configuration
  baseURL: env.BETTER_AUTH_URL,

  // Rate limiting configuration
  rateLimit: {
    enabled: true,
    window: env.RATE_LIMIT_WINDOW,
    max: env.RATE_LIMIT_MAX
  }

});

/**
 * Build trusted origins array with proper filtering and validation
 */
function buildTrustedOrigins (): string[] {
  const origins = [
    // Core application URL
    env.BETTER_AUTH_URL,

    // CORS origin
    env.CORS_ORIGIN,

    // Provider-specific origins
    ...(isProviderEnabled('apple') ? ['https://appleid.apple.com'] : []),

    // Environment-based origins
    ...getTrustedOriginsFromEnv(),

    // Development origins
    ...(env.NODE_ENV === 'development' ? [
      'http://localhost:3000',
      'http://localhost:5173', // Vite dev server
      'http://localhost:3001', // Alternative dev port
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    ] : []),

    // Additional configured origins
    ...(env.ADDITIONAL_TRUSTED_ORIGINS?.split(',') || []),

    // Trusted origins from main config
    ...(env.TRUSTED_ORIGINS?.split(',') || [])
  ];

  // Filter out null, undefined, and empty strings, then remove duplicates
  return [
    ...new Set(origins
      .filter((origin): origin is string => origin !== null &&
        origin !== undefined &&
        typeof origin === 'string' &&
        origin.trim() !== '')
      .map((origin) => origin.trim()))
  ];
}

// Export types for better TypeScript support
export type User = typeof authConfig.$Infer.Session.user;
export type Session = typeof authConfig.$Infer.Session;

// Export the configuration for use in other parts of the application
export default authConfig;
