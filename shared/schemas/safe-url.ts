import { z } from 'zod';

export const siteRelativePathSchema = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine(
    (value) =>
      value.startsWith('/') &&
      !value.startsWith('//') &&
      !value.includes('\\') &&
      ![...value].some((character) => {
        const code = character.charCodeAt(0);
        return code <= 31 || code === 127;
      }),
    'Use a site-relative path beginning with a single slash',
  );

export const httpUrlSchema = z
  .string()
  .trim()
  .max(500)
  .url()
  .refine(
    (value) => URL.canParse(value) && ['http:', 'https:'].includes(new URL(value).protocol),
    'Use HTTP or HTTPS',
  );

const mailtoUrlSchema = z
  .string()
  .trim()
  .max(500)
  .refine((value) => {
    if (!value.toLowerCase().startsWith('mailto:')) return false;

    const address = value.slice(7).split('?')[0];
    return z.string().email().safeParse(address).success;
  }, 'Use a valid email link');

export const safeNavigationUrlSchema = z.union([
  siteRelativePathSchema,
  httpUrlSchema,
  mailtoUrlSchema,
]);
