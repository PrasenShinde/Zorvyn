import type { Response } from 'express';
import { recordService } from '../services/record.service.js';
import type {
  CreateRecordBody,
  ListRecordsQuery,
  UpdateRecordBody,
} from '../schemas/record.schemas.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import { AppError } from '../utils/app-error.js';
import { asyncHandler } from '../utils/async-handler.js';

export const getRecords = asyncHandler(async (req: AuthRequest, res: Response) => {
  const q = req.query as unknown as ListRecordsQuery;
  const records = await recordService.list(req.user!.role, req.user!.id, {
    type: q.type,
    category: q.category,
    page: q.page,
    limit: q.limit,
  });
  res.json(records);
});

export const deleteRecord = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params.id;
  if (typeof id !== 'string') {
    throw new AppError(400, 'Invalid record id');
  }
  const result = await recordService.softDelete(id);
  res.json(result);
});

export const createRecord = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = req.body as CreateRecordBody;
  const record = await recordService.create(body);
  res.status(201).json(record);
});

export const updateRecord = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params.id;
  if (typeof id !== 'string') {
    throw new AppError(400, 'Invalid record id');
  }
  const body = req.body as UpdateRecordBody;
  const record = await recordService.update(id, body);
  res.json(record);
});
