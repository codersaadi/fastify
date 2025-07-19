import type { FastifyInstance } from 'fastify';
import { getAuthDecorator } from 'fastify-better-auth';

import type { authConfig } from '../auth/auth.config.js';

export function getAuthInstance (fastify: FastifyInstance) {
  return getAuthDecorator<typeof authConfig.options>(fastify);
}
