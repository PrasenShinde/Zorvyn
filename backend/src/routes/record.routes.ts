import { Router } from 'express';
import { deleteRecord, getRecords } from '../controllers/record.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validateQuery } from '../middlewares/validate.middleware.js';
import { listRecordsQuerySchema } from '../schemas/record.schemas.js';
import { Role } from '@prisma/client';

const router = Router();

router.get(
  '/records',
  authenticate,
  authorize([Role.ADMIN, Role.ANALYST]),
  validateQuery(listRecordsQuerySchema),
  getRecords
);

router.delete('/records/:id', authenticate, authorize([Role.ADMIN]), deleteRecord);

export default router;
