import { z } from 'zod';

// Common validation schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export const idSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const timestampSchema = z.object({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Response schemas
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
    timestamp: z.string().datetime(),
  });

export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number(),
  timestamp: z.string().datetime(),
  path: z.string().optional(),
});

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    pagination: z.object({
      page: z.number().int().min(1),
      limit: z.number().int().min(1),
      total: z.number().int().min(0),
      totalPages: z.number().int().min(0),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }),
  });

// Health check schemas
export const healthCheckResponseSchema = z.object({
  status: z.enum(['ok', 'error']),
  timestamp: z.string().datetime(),
  uptime: z.number(),
  version: z.string(),
  environment: z.string(),
});

// Common field validations
export const emailSchema = z.string().email('Invalid email format');
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number');

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

export const urlSchema = z.string().url('Invalid URL format');

// Utility functions for schema validation
export const validateBody = <T extends z.ZodTypeAny>(schema: T) => {
  return (data: unknown): z.infer<T> => {
    return schema.parse(data);
  };
};

export const validateQuery = <T extends z.ZodTypeAny>(schema: T) => {
  return (data: unknown): z.infer<T> => {
    return schema.parse(data);
  };
};

export const validateParams = <T extends z.ZodTypeAny>(schema: T) => {
  return (data: unknown): z.infer<T> => {
    return schema.parse(data);
  };
};

// Common error handling for validation
export const handleValidationError = (error: z.ZodError) => {
  const errors = error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));

  return {
    error: 'Validation Error',
    message: 'Request validation failed',
    statusCode: 400,
    details: errors,
    timestamp: new Date().toISOString(),
  };
};