import { getAuthInstance } from '@/decorators/auth.decorator';

import { fromNodeHeaders } from 'better-auth/node';
import type { FastifyInstance, FastifyRequest } from 'fastify';

async function authHook (fastify: FastifyInstance) {
  // Decorate request with session property
  fastify.decorateRequest('auth', null);

  fastify.addHook('preHandler', async (req: FastifyRequest, _res) => {
    const auth = await getAuthInstance(fastify).api.getSession({
      headers: fromNodeHeaders(req.headers)
    });
    console.log('auth hook is getting ', { auth });
    if (auth) {
      req.setDecorator('auth', auth);
    }
  });
}

export default authHook;
