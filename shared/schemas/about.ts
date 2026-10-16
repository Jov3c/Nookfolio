import { z } from 'zod';

export const aboutSiteFactSchema = z.object({
  label: z.string().trim().min(1).max(80),
  value: z.string().trim().min(1).max(160),
});

export const aboutProfileSchema = z.object({
  eyebrow: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1).max(220),
  introduction: z.string().trim().min(1).max(500),
  personalTitle: z.string().trim().min(1).max(120),
  personalBody: z.string().trim().min(1).max(20_000),
  quote: z.string().trim().min(1).max(500),
  siteTitle: z.string().trim().min(1).max(120),
  siteBody: z.string().trim().min(1).max(20_000),
  siteFacts: z.array(aboutSiteFactSchema).min(1).max(8),
});

export const aboutProfileUpdateSchema = aboutProfileSchema.partial();

export type AboutProfileInput = z.infer<typeof aboutProfileSchema>;
export type AboutProfileUpdateInput = z.infer<typeof aboutProfileUpdateSchema>;
export type AboutSiteFact = z.infer<typeof aboutSiteFactSchema>;
