import type { RecordType, Role } from '@prisma/client';
import { AppError } from '../utils/app-error.js';
import { financialRecordRepository } from '../repositories/financial-record.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import type { CreateRecordBody, UpdateRecordBody } from '../schemas/record.schemas.js';

export const recordService = {
  async list(
    actorRole: Role,
    actorId: string,
    params: {
      type?: RecordType;
      category?: string;
      page: number;
      limit: number;
    }
  ) {
    const skip = (params.page - 1) * params.limit;
    const userIdScope = actorRole === 'ADMIN' ? undefined : actorId;

    const rows = await financialRecordRepository.findManyActive({
      userIdScope,
      type: params.type,
      category: params.category,
      skip,
      take: params.limit,
    });

    return rows;
  },

  async softDelete(id: string) {
    const row = await financialRecordRepository.findById(id);
    if (!row || row.deleted_at) {
      throw new AppError(404, 'Record not found');
    }

    await financialRecordRepository.softDelete(id);
    return { message: 'Record deleted successfully' as const };
  },

  async create(body: CreateRecordBody) {
    const user = await userRepository.findById(body.user_id);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return financialRecordRepository.create({
      user_id: body.user_id,
      amount: body.amount,
      type: body.type,
      category: body.category,
      date: body.date,
      notes: body.notes,
    });
  },

  async update(id: string, body: UpdateRecordBody) {
    const row = await financialRecordRepository.findActiveById(id);
    if (!row) {
      throw new AppError(404, 'Record not found');
    }

    const data: {
      amount?: string;
      category?: string;
      notes?: string | null;
    } = {};
    if (body.amount !== undefined) data.amount = body.amount;
    if (body.category !== undefined) data.category = body.category;
    if (body.notes !== undefined) data.notes = body.notes;

    return financialRecordRepository.update(id, data);
  },
};
