import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(128),
});

export const verifyLoginSchema = z.object({
  challengeToken: z.string().min(32).max(200),
  code: z.string().regex(/^\d{6}$/),
});

export const resendLoginCodeSchema = z.object({
  challengeToken: z.string().min(32).max(200),
});
