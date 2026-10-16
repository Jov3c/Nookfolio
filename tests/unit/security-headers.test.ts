import { readFile } from 'node:fs/promises';
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

  it('registers the supplied artwork as the site icon', async () => {
    const config = await readFile(resolve(process.cwd(), 'nuxt.config.ts'), 'utf8');

    expect(config).toContain("href: '/nookfolio-icon.png'");
    await expect(
      readFile(resolve(process.cwd(), 'public/nookfolio-icon.png')),
    ).resolves.toBeInstanceOf(Buffer);
  });
});
