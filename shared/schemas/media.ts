import { z } from 'zod';

import { mediaCategorySchema } from '../constants/media';

export const mediaListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(24),
  q: z.string().trim().max(80).default(''),
});

export const mediaUploadFieldsSchema = z.object({
  category: mediaCategorySchema.default('general'),
  altText: z.string().trim().max(300).default(''),
});

export const mediaImportSchema = mediaUploadFieldsSchema.extend({
  url: z
    .string()
    .trim()
    .max(1000)
    .url()
    .refine((value) => ['http:', 'https:'].includes(new URL(value).protocol), 'Use HTTP or HTTPS'),
});

export const mediaUpdateSchema = z.object({
  altText: z.string().trim().max(300).nullable(),
});

export type MediaListQuery = z.infer<typeof mediaListQuerySchema>;
export type MediaUploadFields = z.infer<typeof mediaUploadFieldsSchema>;
export type MediaImportInput = z.infer<typeof mediaImportSchema>;
export type MediaUpdateInput = z.infer<typeof mediaUpdateSchema>;
