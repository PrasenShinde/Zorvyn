import { RecordType } from '@prisma/client';
import { z } from 'zod';

export const listRecordsQuerySchema = z.object({
  type: z.nativeEnum(RecordType).optional(),
  category: z.string().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListRecordsQuery = z.infer<typeof listRecordsQuerySchema>;
