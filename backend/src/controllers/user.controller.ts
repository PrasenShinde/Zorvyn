import type { Response } from 'express';
import { userService } from '../services/user.service.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

export const getUsers = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const users = await userService.listForAdmin();
  res.json(users);
});
