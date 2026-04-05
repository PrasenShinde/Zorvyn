import { Router } from 'express';
import {
  createRecord,
  deleteRecord,
  getRecords,
  updateRecord,
} from '../controllers/record.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validateBody, validateQuery } from '../middlewares/validate.middleware.js';
import {
  createRecordBodySchema,
  listRecordsQuerySchema,
  updateRecordBodySchema,
} from '../schemas/record.schemas.js';
import { Role } from '@prisma/client';

const router = Router();

router.get(
  '/records',
  authenticate,
  authorize([Role.ADMIN, Role.ANALYST]),
  validateQuery(listRecordsQuerySchema),
  getRecords
);

router.post(
  '/records',
  authenticate,
  authorize([Role.ADMIN]),
  validateBody(createRecordBodySchema),
  createRecord
);

router.put(
  '/records/:id',
  authenticate,
  authorize([Role.ADMIN]),
  validateBody(updateRecordBodySchema),
  updateRecord
);

router.delete('/records/:id', authenticate, authorize([Role.ADMIN]), deleteRecord);

export default router;
