import { z } from 'zod';

export const MEDIA_CATEGORIES = [
  'avatars',
  'icons',
  'blog',
  'projects',
  'timeline',
  'links',
  'general',
] as const;

export type MediaCategory = (typeof MEDIA_CATEGORIES)[number];

export const mediaCategorySchema = z.enum(MEDIA_CATEGORIES);
