import { describe, expect, it } from 'vitest';

import { parseBootstrapConfig } from '../../server/services/admin-bootstrap';
import { SlidingWindowRateLimiter } from '../../server/utils/rate-limit';
import { isSameOriginRequest, selectTrustedClientIp } from '../../server/utils/request-security';
import {
  createSessionToken,
  hashPassword,
  hashSessionToken,
  verifyPassword,
} from '../../server/utils/security';

describe('admin authentication security', () => {
  it('hashes and verifies passwords with Argon2id', async () => {
    const hash = await hashPassword('a-strong-bootstrap-password');

    expect(hash).toMatch(/^\$argon2id\$/);
    await expect(verifyPassword(hash, 'a-strong-bootstrap-password')).resolves.toBe(true);
    await expect(verifyPassword(hash, 'wrong-password')).resolves.toBe(false);
  });

  it('creates an opaque token and stores only its SHA-256 representation', () => {
    const token = createSessionToken();
    const tokenHash = hashSessionToken(token);

    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(tokenHash).not.toContain(token);
  });

  it('requires explicit safe bootstrap values', () => {
    expect(() => parseBootstrapConfig({})).toThrow('ADMIN_EMAIL');
    expect(() =>
      parseBootstrapConfig({
        ADMIN_EMAIL: 'ADMIN@EXAMPLE.COM',
        ADMIN_PASSWORD: 'short',
        ADMIN_DISPLAY_NAME: 'Nookfolio',
      }),
    ).toThrow('12');

    expect(
      parseBootstrapConfig({
        ADMIN_EMAIL: 'ADMIN@EXAMPLE.COM',
        ADMIN_PASSWORD: 'a-strong-bootstrap-password',
        ADMIN_DISPLAY_NAME: 'Nookfolio',
      }).email,
    ).toBe('admin@example.com');
  });

  it('limits login attempts within a bounded time window', () => {
    const limiter = new SlidingWindowRateLimiter({ limit: 2, windowMs: 1_000, maxKeys: 10 });

    expect(limiter.consume('ip', 0).allowed).toBe(true);
    expect(limiter.consume('ip', 100).allowed).toBe(true);
    expect(limiter.consume('ip', 200).allowed).toBe(false);
    expect(limiter.consume('ip', 1_001).allowed).toBe(true);
  });

  it('uses the proxy-appended client address instead of a spoofed forwarded address', () => {
    expect(selectTrustedClientIp('198.51.100.11, 203.0.113.8', '127.0.0.1')).toBe('203.0.113.8');
    expect(selectTrustedClientIp('not-an-ip', '127.0.0.1')).toBe('127.0.0.1');
  });

  it('requires an exact origin match for authenticated writes', () => {
    expect(isSameOriginRequest('https://jov3.cloud', 'jov3.cloud')).toBe(true);
    expect(isSameOriginRequest('https://evil.example', 'jov3.cloud')).toBe(false);
    expect(isSameOriginRequest(undefined, 'jov3.cloud')).toBe(false);
  });
});
