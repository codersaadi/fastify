import { getAuthInstance } from '@/decorators/auth.decorator';
import { Session, User } from 'better-auth/*';
import { fromNodeHeaders } from 'better-auth/node';
import type { FastifyInstance, FastifyRequest } from 'fastify';

// Extend FastifyRequest to include session
declare module 'fastify' {
  interface FastifyRequest {
    auth: {
      user : User,
      session : Session
    };
  }
}

async function authHook(fastify: FastifyInstance) {
  // Decorate request with session property
  fastify.decorateRequest('auth', null);

  fastify.addHook('preHandler', async (req: FastifyRequest, res) => {
    const session = await getAuthInstance(fastify).api.getSession({
      headers: fromNodeHeaders(req.headers)
    });

    if (!session?.user) {
      return res.unauthorized('You must be logged in to access this resource.');
    }

    // Set session on request object
    req.auth = session;
  });
}

export default authHook;