import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { SECURITY_HEADERS } from '../../server/utils/security-headers';

describe('HTTP security headers', () => {
  it('defines a restrictive baseline policy for every response', () => {
    expect(SECURITY_HEADERS['Content-Security-Policy']).toContain("default-src 'self'");
    expect(SECURITY_HEADERS['Content-Security-Policy']).toContain("object-src 'none'");
    expect(SECURITY_HEADERS['X-Content-Type-Options']).toBe('nosniff');
    expect(SECURITY_HEADERS['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
  });

  it('registers the Nookfolio logo icon suite', async () => {
    const config = await readFile(resolve(process.cwd(), 'nuxt.config.ts'), 'utf8');
    const manifest = JSON.parse(
      await readFile(resolve(process.cwd(), 'public/site.webmanifest'), 'utf8'),
    );

    expect(config).toContain("href: '/favicon.svg'");
    expect(config).toContain("href: '/apple-touch-icon.png'");
    expect(config).toContain("href: '/site.webmanifest'");
    expect(config).toContain("content: '#EA632B'");
    expect(manifest.name).toBe('Nookfolio');
    expect(await readdir(resolve(process.cwd(), 'public/brand'))).toEqual([
      'nookfolio-app-icon.svg',
    ]);

    for (const asset of [
      'favicon.svg',
      'favicon.ico',
      'favicon-32.png',
      'apple-touch-icon.png',
      'icon-192.png',
      'icon-512.png',
      'maskable-512.png',
      'site.webmanifest',
    ]) {
      await expect(readFile(resolve(process.cwd(), 'public', asset))).resolves.toBeInstanceOf(
        Buffer,
      );
    }
  });
});
