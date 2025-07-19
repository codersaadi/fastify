import {auth} from '@/auth';

import type { FastifyRequest } from 'fastify';

type Auth = Awaited<ReturnType<typeof auth.api.getSession>>;

export function getSessionDecorator (request: FastifyRequest) {
  return request.getDecorator<Auth>('auth');
}
