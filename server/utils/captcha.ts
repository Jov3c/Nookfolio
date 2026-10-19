import type { CaptchaPurpose } from '../../shared/schemas/captcha';
import { CaptchaChallengeRepository } from '../repositories/captcha-repository';
import { CaptchaService } from '../services/captcha-service';
import { usePrisma } from './prisma';
import { SlidingWindowRateLimiter } from './rate-limit';

interface PublicCaptchaInput {
  purpose: CaptchaPurpose;
  ipHash: string;
  now?: number;
}

interface PublicCaptchaDependencies {
  limiter: SlidingWindowRateLimiter;
  issue: (
    purpose: CaptchaPurpose,
    ipHash: string,
    now: Date,
  ) => Promise<{ id: string; image: string; expiresAt: Date }>;
}

export class CaptchaIssueError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
    message: string,
    readonly retryAfterMs = 0,
  ) {
    super(message);
    this.name = 'CaptchaIssueError';
  }
}

export async function issuePublicCaptcha(
  input: PublicCaptchaInput,
  dependencies: PublicCaptchaDependencies,
) {
  const now = input.now ?? Date.now();
  const limit = dependencies.limiter.consume(input.ipHash, now);
  if (!limit.allowed) {
    throw new CaptchaIssueError(
      429,
      'CAPTCHA_RATE_LIMITED',
      '验证码请求过于频繁，请稍后再试。',
      limit.retryAfterMs,
    );
  }
  return dependencies.issue(input.purpose, input.ipHash, new Date(now));
}

export function publicCaptchaHeaders() {
  return {
    'Cache-Control': 'no-store, max-age=0',
    Pragma: 'no-cache',
  } as const;
}

export function useCaptchaService() {
  const secret = process.env.CAPTCHA_SECRET ?? process.env.ADMIN_PASSWORD ?? '';
  return new CaptchaService(new CaptchaChallengeRepository(usePrisma()), secret);
}
