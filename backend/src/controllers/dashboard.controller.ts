import type { Response } from 'express';
import { dashboardService } from '../services/dashboard.service.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

export const getDashboardSummary = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const summary = await dashboardService.getSummary();
  res.json(summary);
});
