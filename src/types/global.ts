import { Config } from '@/config/env';

import { FastifyRequest, FastifyReply } from 'fastify';

// Extend Fastify types
declare module 'fastify' {
  interface FastifyInstance {
    config: Config;
  }
}

// Common response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path?: string | undefined;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Request/Reply type helpers
export type FastifyRequestWithUser = FastifyRequest & {
  user?: {
    id: string;
    email: string;
    role: string;
  };
};

export type FastifyReplyTyped<T = any> = FastifyReply & {
  send: (payload: T) => FastifyReply;
};

// Common query parameters
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Health check types
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
}

// Generic handler types
export type AsyncHandler<T = any> = (
  request: FastifyRequest,
  reply: FastifyReply
) => Promise<T>;

export type Handler<T = any> = (
  request: FastifyRequest,
  reply: FastifyReply
) => T;

// Utility types
export type WithTimestamp<T> = T & { timestamp: string };
export type WithId<T> = T & { id: string };
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
