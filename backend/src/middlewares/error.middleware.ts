import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/app-error.js';

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: err.flatten(),
    });
  }

  console.error(err);
  return res.status(500).json({ message: 'Internal server error' });
};
