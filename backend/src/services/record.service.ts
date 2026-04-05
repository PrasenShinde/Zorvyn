import type { RecordType, Role } from '@prisma/client';
import { AppError } from '../utils/app-error.js';
import { financialRecordRepository } from '../repositories/financial-record.repository.js';

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
};
