import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboard.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { Role } from '@prisma/client';

const router = Router();

router.get(
  '/summary',
  authenticate,
  authorize([Role.ADMIN, Role.ANALYST, Role.VIEWER]),
  getDashboardSummary
);

export default router;
