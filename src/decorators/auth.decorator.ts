import type { FastifyInstance } from 'fastify';
import { getAuthDecorator } from 'fastify-better-auth';

import type auth from '../auth/auth.js';

export function getAuthInstance (fastify: FastifyInstance) {
  return getAuthDecorator<typeof auth.options>(fastify);
}
