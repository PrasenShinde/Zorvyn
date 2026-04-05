import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

export const validateBody =
  <T>(schema: ZodSchema<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: result.error.flatten(),
      });
    }
    req.body = result.data;
    next();
  };

export const validateQuery =
  <T>(schema: ZodSchema<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: result.error.flatten(),
      });
    }
    // Never assign Zod output onto `req.query` — Express 5 expects string/query
    // dictionaries; replacing it with numbers/objects causes runtime errors on GET.
    req.validatedQuery = result.data;
    next();
  };
