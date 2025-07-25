import { getSessionDecorator } from '@/decorators/session.decorator';
import { initTRPC, TRPCError } from '@trpc/server';
import { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify';
import superjson from 'superjson';
import { ZodError } from 'zod';

// Create context for tRPC
export const createTRPCContext = async ({
  req,
  res
}: CreateFastifyContextOptions) => {
  let auth;
  try {
    auth = getSessionDecorator(req);
  } catch (error) {
    // If auth decorator fails, provide null auth
    auth = null;
    req.log?.warn({ error }, 'Failed to get auth session');
  }
  return {
    req,
    res,
    auth
  };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter ({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null
      }
    };
  }
});

// Base router and procedure
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// Middleware to check if user is authenticated
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.auth?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
      auth: ctx.auth

    }
  });
});

// Protected procedure that requires authentication
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

