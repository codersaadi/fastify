import { z } from 'zod';
import { FastifyRequest, FastifyReply } from 'fastify';
import { validationErrorResponse } from '@/utils/response';

// Validation middleware creator
export const createValidationMiddleware = <
  TBody extends z.ZodTypeAny = z.ZodVoid,
  TQuery extends z.ZodTypeAny = z.ZodVoid,
  TParams extends z.ZodTypeAny = z.ZodVoid
>(schemas: {
  body?: TBody;
  query?: TQuery;
  params?: TParams;
}) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (schemas.body) {
        request.body = schemas.body.parse(request.body);
      }
      
      if (schemas.query) {
        request.query = schemas.query.parse(request.query);
      }
      
      if (schemas.params) {
        request.params = schemas.params.parse(request.params);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        //   received: err.received,
        }));
        
        return validationErrorResponse(
          reply,
          'Request validation failed',
          validationErrors
        );
      }
      
      throw error;
    }
  };
};

// Safe validation function
export const safeValidate = <T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
};

// Transform validation errors to user-friendly format
export const formatValidationErrors = (error: z.ZodError) => {
  return error.errors.map(err => {
    const path = err.path.join('.');
    let message = err.message;
    
    // Customize error messages based on error type
    switch (err.code) {
      case 'invalid_type':
        message = `Expected ${err.expected} but received ${err.received}`;
        break;
      case 'too_small':
        if (err.type === 'string') {
          message = `Must be at least ${err.minimum} characters long`;
        } else if (err.type === 'number') {
          message = `Must be at least ${err.minimum}`;
        } else if (err.type === 'array') {
          message = `Must have at least ${err.minimum} items`;
        }
        break;
      case 'too_big':
        if (err.type === 'string') {
          message = `Must be at most ${err.maximum} characters long`;
        } else if (err.type === 'number') {
          message = `Must be at most ${err.maximum}`;
        } else if (err.type === 'array') {
          message = `Must have at most ${err.maximum} items`;
        }
        break;
      case 'invalid_string':
        if (err.validation === 'email') {
          message = 'Invalid email format';
        } else if (err.validation === 'url') {
          message = 'Invalid URL format';
        } else if (err.validation === 'uuid') {
          message = 'Invalid UUID format';
        }
        break;
      case 'invalid_enum_value':
        message = `Must be one of: ${err.options.join(', ')}`;
        break;
    }
    
    return {
      field: path || 'root',
      message,
      code: err.code,
    };
  });
};

// Common validation schemas
export const createPaginationSchema = (
  defaultLimit = 20,
  maxLimit = 100
) => z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(maxLimit).default(defaultLimit),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('asc'),
  search: z.string().optional(),
});

export const createIdSchema = (fieldName = 'id') => z.object({
  [fieldName]: z.string().uuid(`Invalid ${fieldName} format`),
});

// Validation decorators (for class-based approaches)
export const ValidateBody = <T extends z.ZodTypeAny>(schema: T) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(request: FastifyRequest, reply: FastifyReply) {
      const validation = safeValidate(schema, request.body);
      
      if (!validation.success) {
        return validationErrorResponse(
          reply,
          'Request body validation failed',
          formatValidationErrors(validation.error)
        );
      }
      
      request.body = validation.data;
      return originalMethod.call(this, request, reply);
    };
  };
};

export const ValidateQuery = <T extends z.ZodTypeAny>(schema: T) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(request: FastifyRequest, reply: FastifyReply) {
      const validation = safeValidate(schema, request.query);
      
      if (!validation.success) {
        return validationErrorResponse(
          reply,
          'Query parameters validation failed',
          formatValidationErrors(validation.error)
        );
      }
      
      request.query = validation.data;
      return originalMethod.call(this, request, reply);
    };
  };
};

export const ValidateParams = <T extends z.ZodTypeAny>(schema: T) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(request: FastifyRequest, reply: FastifyReply) {
      const validation = safeValidate(schema, request.params);
      
      if (!validation.success) {
        return validationErrorResponse(
          reply,
          'URL parameters validation failed',
          formatValidationErrors(validation.error)
        );
      }
      
      request.params = validation.data;
      return originalMethod.call(this, request, reply);
    };
  };
};