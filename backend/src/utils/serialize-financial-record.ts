import type { FinancialRecord } from '@prisma/client';

/** Plain JSON shape for API responses (ISO date strings, no Prisma class instances). */
export function financialRecordToJson(r: FinancialRecord) {
  return {
    id: r.id,
    user_id: r.user_id,
    amount: r.amount,
    type: r.type,
    category: r.category,
    date: r.date.toISOString(),
    notes: r.notes,
    created_at: r.created_at.toISOString(),
    updated_at: r.updated_at.toISOString(),
    deleted_at: r.deleted_at ? r.deleted_at.toISOString() : null,
  };
}
