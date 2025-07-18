import pino, { Logger } from 'pino';
import { config } from '@/config/env';
import { FastifyReply, FastifyRequest } from 'fastify';

// Create base logger options
const baseLoggerOptions = {
  level: config.LOG_LEVEL,
  formatters: {
    level: (label: string) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      'password',
      'token',
      'secret',
      'key',
    ],
    censor: '[REDACTED]',
  },
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
};

// Conditionally add transport only when needed
const loggerOptions = config.NODE_ENV === 'development' && config.LOG_PRETTY 
  ? {
      ...baseLoggerOptions,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    }
  : baseLoggerOptions;

export const logger = pino(loggerOptions) satisfies Logger<any,boolean>;

// Custom log methods for common use cases
export const logRequest = (req: FastifyRequest, message?: string) => {
  logger.info({
    req: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      remoteAddress: req.ip,
      remotePort: req.socket?.remotePort,
    },
  }, message || 'Request received');
};

export const logResponse = (res: FastifyReply, message?: string) => {
  logger.info({
    res: {
      statusCode: res.statusCode,
      headers: res.getHeaders(),
    },
  }, message || 'Response sent');
};

export const logError = (error: Error, context?: Record<string, unknown>) => {
  logger.error({
    err: error,
    context,
  }, 'Error occurred');
};

export const logPerformance = (operation: string, duration: number, metadata?: Record<string, unknown>) => {
  logger.info({
    operation,
    duration,
    metadata,
  }, `Performance: ${operation} took ${duration}ms`);
};