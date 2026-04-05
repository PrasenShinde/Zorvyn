import type { FinancialRecord, Prisma, RecordType } from '@prisma/client';
import { prisma } from '../config/database.js';

export type FinancialRecordListFilters = {
  userIdScope?: string;
  type?: RecordType;
  category?: string;
  skip: number;
  take: number;
};

export const financialRecordRepository = {
  findManyActive(filters: FinancialRecordListFilters): Promise<FinancialRecord[]> {
    const where: Prisma.FinancialRecordWhereInput = {
      deleted_at: null,
      ...(filters.userIdScope ? { user_id: filters.userIdScope } : {}),
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.category ? { category: filters.category } : {}),
    };

    return prisma.financialRecord.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: filters.skip,
      take: filters.take,
    });
  },

  findActiveById(id: string): Promise<FinancialRecord | null> {
    return prisma.financialRecord.findFirst({
      where: { id, deleted_at: null },
    });
  },

  findById(id: string): Promise<FinancialRecord | null> {
    return prisma.financialRecord.findUnique({ where: { id } });
  },

  softDelete(id: string): Promise<FinancialRecord> {
    return prisma.financialRecord.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  },
};
