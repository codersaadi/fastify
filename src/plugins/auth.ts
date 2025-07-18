import auth from '@/auth';

import type { FastifyInstance } from 'fastify';
import FastifyBetterAuth from 'fastify-better-auth';
import fp from 'fastify-plugin';

async function authPlugin (fastify: FastifyInstance) {
  await fastify.register(FastifyBetterAuth, { auth });
}

export default fp(authPlugin, {
  name: 'auth-plugin'
});
//
// The plugin automatically registers the following authentication routes:
// POST /api/auth/sign-in - Sign in with email/password
// POST /api/auth/sign-up - Create a new account
// POST /api/auth/sign-out - Sign out the current user
// GET /api/auth/session - Get current session
// And all other Better Auth endpoints...
//
