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
    req.query = result.data as Request['query'];
    next();
  };
