import { env, getTrustedOriginsFromEnv } from '@/config/env';

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, openAPI } from 'better-auth/plugins';

import { getAuthProviders, isProviderEnabled } from './providers';

import { db } from '../db/index';
export const authConfig = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true
  }),
  plugins: [
    admin(),
    openAPI({
      path: '/docs'
    })
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 1 week
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 // Cache duration in seconds
    }
  },
  emailAndPassword: {
    enabled: env.ENABLE_EMAIL_PASSWORD === 'true',
    disableSignUp: env.DISABLE_SIGNUP === 'true'
  },

  socialProviders: getAuthProviders(),

  advanced: {
    cookiePrefix: 'code-fastify',
    database: {
      generateId: false
    }
  },
  trustedOrigins: [
    isProviderEnabled('apple') ? 'https://appleid.apple.com' : null,
    env.BETTER_AUTH_URL,
    ...getTrustedOriginsFromEnv()
  ].filter((origin): origin is string => origin !== null)

});

export type User = typeof authConfig.$Infer.Session.user;
export type Session = typeof authConfig.$Infer.Session;
