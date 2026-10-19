import { describe, expect, it } from 'vitest';

import { SlidingWindowRateLimiter } from '../../server/utils/rate-limit';
import {
  CaptchaIssueError,
  issuePublicCaptcha,
  publicCaptchaHeaders,
} from '../../server/utils/captcha';

describe('public captcha contract', () => {
  it('returns a no-store challenge without exposing its answer', async () => {
    const limiter = new SlidingWindowRateLimiter({ limit: 2, windowMs: 60_000, maxKeys: 10 });
    const result = await issuePublicCaptcha(
      { purpose: 'COMMENT', ipHash: 'ip-a', now: 1_000 },
      {
        limiter,
        issue: async () => ({
          id: '11111111-1111-4111-8111-111111111111',
          image: 'data:image/svg+xml;base64,PHN2Zy8+',
          expiresAt: new Date('2026-10-19T09:05:00.000Z'),
        }),
      },
    );

    expect(result.id).toBe('11111111-1111-4111-8111-111111111111');
    expect(JSON.stringify(result)).not.toMatch(/answer|7K3M/i);
    expect(publicCaptchaHeaders()).toEqual({
      'Cache-Control': 'no-store, max-age=0',
      Pragma: 'no-cache',
    });
  });

  it('rate limits challenge generation per anonymous IP hash', async () => {
    const limiter = new SlidingWindowRateLimiter({ limit: 1, windowMs: 60_000, maxKeys: 10 });
    const dependencies = {
      limiter,
      issue: async () => ({
        id: '11111111-1111-4111-8111-111111111111',
        image: 'data:image/svg+xml;base64,PHN2Zy8+',
        expiresAt: new Date('2026-10-19T09:05:00.000Z'),
      }),
    };

    await issuePublicCaptcha({ purpose: 'MESSAGE', ipHash: 'ip-a', now: 1_000 }, dependencies);

    await expect(
      issuePublicCaptcha({ purpose: 'MESSAGE', ipHash: 'ip-a', now: 2_000 }, dependencies),
    ).rejects.toMatchObject<Partial<CaptchaIssueError>>({ code: 'CAPTCHA_RATE_LIMITED' });
  });
});
