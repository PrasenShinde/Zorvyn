import { RecordType } from '@prisma/client';
import { z } from 'zod';

/** Positive decimal string: integer or up to 2 fractional digits (e.g. `100`, `99.5`, `10.25`). */
const POSITIVE_AMOUNT_REGEX = /^\d+(\.\d{1,2})?$/;

export const positiveAmountStringSchema = z
  .string()
  .regex(POSITIVE_AMOUNT_REGEX, 'Amount must be a valid positive decimal string')
  .refine((s) => parseFloat(s) > 0, 'Amount must be positive');

export const createRecordBodySchema = z.object({
  user_id: z.string().uuid(),
  amount: positiveAmountStringSchema,
  type: z.nativeEnum(RecordType),
  category: z.string().min(1),
  date: z.coerce.date(),
  notes: z.string().optional(),
});

export const updateRecordBodySchema = z
  .object({
    amount: positiveAmountStringSchema.optional(),
    category: z.string().min(1).optional(),
    notes: z.union([z.string(), z.null()]).optional(),
  })
  .refine(
    (data) =>
      data.amount !== undefined || data.category !== undefined || data.notes !== undefined,
    { message: 'At least one of amount, category, or notes is required' }
  );

export type CreateRecordBody = z.infer<typeof createRecordBodySchema>;
export type UpdateRecordBody = z.infer<typeof updateRecordBodySchema>;

export const listRecordsQuerySchema = z.object({
  type: z.nativeEnum(RecordType).optional(),
  category: z.string().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListRecordsQuery = z.infer<typeof listRecordsQuerySchema>;
