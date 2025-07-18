import { getAuthInstance } from '@/decorators/auth.decorator';

import { fromNodeHeaders } from 'better-auth/node';
import type { FastifyInstance, FastifyRequest } from 'fastify';

async function authHook (fastify: FastifyInstance) {
  // Decorate request with session property
  fastify.decorateRequest('auth', null);

  fastify.addHook('preHandler', async (req: FastifyRequest, res) => {
    const auth = await getAuthInstance(fastify).api.getSession({
      headers: fromNodeHeaders(req.headers)
    });

    if (!auth?.user) {
      return res.unauthorized('You must be logged in to access this resource.');
    }

    // Set auth on request object
    req.setDecorator('auth', auth);
  });
}

export default authHook;
