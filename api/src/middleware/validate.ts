import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Universal request validation middleware using Zod.
 * Validates any combination of req.body, req.query, and req.params.
 */
export function validate(schemas: ValidationSchemas) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = (await schemas.query.parseAsync(req.query)) as any;
      }
      if (schemas.params) {
        req.params = (await schemas.params.parseAsync(req.params)) as any;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string[]> = {};
        for (const issue of error.issues) {
          const path = issue.path.join('.') || 'root';
          if (!fieldErrors[path]) {
            fieldErrors[path] = [];
          }
          fieldErrors[path].push(issue.message);
        }

        res.status(400).json({
          success: false,
          error: 'Validation failed.',
          errors: fieldErrors,
        });
        return;
      }

      res.status(400).json({
        success: false,
        error: 'Invalid request data.',
      });
    }
  };
}

/**
 * Convenience helper to validate only req.body
 */
export function validateBody(schema: ZodSchema) {
  return validate({ body: schema });
}

/**
 * Convenience helper to validate only req.query
 */
export function validateQuery(schema: ZodSchema) {
  return validate({ query: schema });
}

/**
 * Convenience helper to validate only req.params
 */
export function validateParams(schema: ZodSchema) {
  return validate({ params: schema });
}
