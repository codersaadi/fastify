import type { FastifyRequest } from 'fastify';

export function getSessionDecorator (request: FastifyRequest) {
  return request.auth
}
