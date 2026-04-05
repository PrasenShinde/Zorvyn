import type { Response } from 'express';
import { authService } from '../services/auth.service.js';
import type { LoginBody, RegisterBody } from '../schemas/auth.schemas.js';
import { asyncHandler } from '../utils/async-handler.js';

export const register = asyncHandler(async (req, res: Response) => {
  const body = req.body as RegisterBody;
  const result = await authService.register(body.email, body.password);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req, res: Response) => {
  const body = req.body as LoginBody;
  const result = await authService.login(body.email, body.password);
  res.json(result);
});
