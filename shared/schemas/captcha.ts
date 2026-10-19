import { z } from 'zod';

export const captchaPurposeSchema = z.enum(['COMMENT', 'MESSAGE', 'REPLY']);

export const captchaConsumeSchema = z.object({
  id: z.string().uuid(),
  answer: z.string().trim().min(4).max(8),
});

export type CaptchaPurpose = z.infer<typeof captchaPurposeSchema>;
export type CaptchaConsumeInput = z.infer<typeof captchaConsumeSchema>;
