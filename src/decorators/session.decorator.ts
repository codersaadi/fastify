import { auth } from '@/auth';

import type { FastifyRequest } from 'fastify';

export type AuthResult = Awaited<ReturnType<typeof auth.api.getSession>>;

/**
 * Gets the authenticated session from the Fastify request decorator
 * @param request - The Fastify request object
 * @returns The authentication result containing session data
 */
export function getSessionDecorator (request: FastifyRequest): AuthResult {
  return request.getDecorator<AuthResult>('auth');
}

/**
 * Type guard to check if the auth result contains a valid session
 * @param authResult - The auth result to check
 * @returns True if the session is valid and user is authenticated
 */
export function isAuthenticated (authResult: AuthResult): authResult is NonNullable<AuthResult> & { session: NonNullable<AuthResult>['session'] } {
  return authResult?.session !== null && authResult?.session !== undefined;
}

/**
 * Gets the user ID from the authenticated session
 * @param request - The Fastify request object
 * @returns The user ID if authenticated, null otherwise
 */
export function getUserId (request: FastifyRequest): string | null {
  const authResult = getSessionDecorator(request);
  return isAuthenticated(authResult) ? authResult.session.userId : null;
}

/**
 * Gets the session ID from the authenticated session
 * @param request - The Fastify request object
 * @returns The session ID if authenticated, null otherwise
 */
export function getSessionId (request: FastifyRequest): string | null {
  const authResult = getSessionDecorator(request);
  return isAuthenticated(authResult) ? authResult.session.id : null;
}

/**
 * Requires authentication and throws if not authenticated
 * @param request - The Fastify request object
 * @returns The authenticated session
 * @throws Will throw an error if not authenticated
 */
export function requireAuth (request: FastifyRequest): NonNullable<AuthResult> & { session: NonNullable<AuthResult>['session'] } {
  const authResult = getSessionDecorator(request);

  if (!isAuthenticated(authResult)) {
    throw new Error('Authentication required');
  }

  return authResult;
}
