import FastifyMultipart from '@fastify/multipart';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

async function multipartPlugin (fastify: FastifyInstance) {
  await fastify.register(FastifyMultipart, {
    limits: {
      fieldNameSize: 100,
      fieldSize: 100,
      fields: 10,
      fileSize: 1 * 1024 * 1024,
      files: 1,
      parts: 1000
    }
  });
}

export default fp(multipartPlugin, {
  name: 'multipart-plugin'
});
