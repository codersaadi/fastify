import { ApiResponse, ErrorResponse, PaginatedResponse } from '@/types/global';

import { FastifyReply } from 'fastify';

// Success response helper
export const successResponse = <T>(
  reply: FastifyReply,
  data: T,
  message: string = '',
  statusCode = 200
): FastifyReply => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  };

  return reply.code(statusCode).send(response);
};

// Error response helper
export const errorResponse = (
  reply: FastifyReply,
  error: string,
  message: string,
  statusCode = 500,
  path?: string
): FastifyReply => {
  const response: ErrorResponse = {
    error,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    path
  };

  return reply.code(statusCode).send(response);
};

// Paginated response helper
export const paginatedResponse = <T>(
  reply: FastifyReply,
  data: T[],
  page: number,
  limit: number,
  total: number,
  statusCode = 200
): FastifyReply => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  const response: PaginatedResponse<T> = {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev
    }
  };

  return reply.code(statusCode).send(response);
};

// Common error responses
export const notFoundResponse = (
  reply: FastifyReply,
  resource = 'Resource',
  id?: string
): FastifyReply => {
  const message = id
    ? `${resource} with ID ${id} not found`
    : `${resource} not found`;

  return errorResponse(reply, 'Not Found', message, 404);
};

export const validationErrorResponse = (
  reply: FastifyReply,
  message = 'Validation failed',
  details?: any
): FastifyReply => {
  const response = {
    error: 'Validation Error',
    message,
    statusCode: 400,
    timestamp: new Date().toISOString(),
    details
  };

  return reply.code(400).send(response);
};

export const unauthorizedResponse = (
  reply: FastifyReply,
  message = 'Unauthorized access'
): FastifyReply => {
  return errorResponse(reply, 'Unauthorized', message, 401);
};

export const forbiddenResponse = (
  reply: FastifyReply,
  message = 'Forbidden access'
): FastifyReply => {
  return errorResponse(reply, 'Forbidden', message, 403);
};

export const conflictResponse = (
  reply: FastifyReply,
  message = 'Resource conflict'
): FastifyReply => {
  return errorResponse(reply, 'Conflict', message, 409);
};

export const tooManyRequestsResponse = (
  reply: FastifyReply,
  message = 'Too many requests'
): FastifyReply => {
  return errorResponse(reply, 'Too Many Requests', message, 429);
};

export const internalServerErrorResponse = (
  reply: FastifyReply,
  message = 'Internal server error'
): FastifyReply => {
  return errorResponse(reply, 'Internal Server Error', message, 500);
};

// Response timing helper
export const withTiming = async <T>(
  operation: () => Promise<T>,
  reply: FastifyReply,
  operationName?: string
): Promise<T> => {
  const start = Date.now();

  try {
    const result = await operation();
    const duration = Date.now() - start;

    reply.header('X-Response-Time', `${duration}ms`);

    if (operationName) {
      reply.header('X-Operation', operationName);
    }

    return result;
  } catch (error) {
    const duration = Date.now() - start;
    reply.header('X-Response-Time', `${duration}ms`);
    throw error;
  }
};
