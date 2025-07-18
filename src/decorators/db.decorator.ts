import type { FastifyRequest } from 'fastify';

export function getDbDecorator (request: FastifyRequest) {
  return request.db
}
