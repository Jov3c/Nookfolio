import { getQuery, setResponseHeader } from 'h3';

import { captchaPurposeSchema } from '../../../../shared/schemas/captcha';
import { apiError } from '../../../utils/api-response';
import {
  CaptchaIssueError,
  issuePublicCaptcha,
  publicCaptchaHeaders,
  useCaptchaService,
} from '../../../utils/captcha';
import { SlidingWindowRateLimiter } from '../../../utils/rate-limit';
import { getVisitorIpHash } from '../../../utils/visitor';

const captchaLimiter = new SlidingWindowRateLimiter({
  limit: 12,
  windowMs: 60 * 1_000,
  maxKeys: 20_000,
});

export default defineEventHandler(async (event) => {
  const purpose = captchaPurposeSchema.safeParse(getQuery(event).purpose);
  if (!purpose.success) {
    return apiError(event, 400, 'INVALID_CAPTCHA_PURPOSE', '验证码用途无效。');
  }

  for (const [name, value] of Object.entries(publicCaptchaHeaders())) {
    setResponseHeader(event, name, value);
  }

  const ipHash = getVisitorIpHash(event);
  try {
    const service = useCaptchaService();
    return {
      data: await issuePublicCaptcha(
        { purpose: purpose.data, ipHash },
        {
          limiter: captchaLimiter,
          issue: (challengePurpose, challengeIpHash, now) =>
            service.issue(challengePurpose, challengeIpHash, now),
        },
      ),
    };
  } catch (error) {
    if (error instanceof CaptchaIssueError) {
      if (error.retryAfterMs) {
        setResponseHeader(event, 'Retry-After', Math.ceil(error.retryAfterMs / 1_000));
      }
      return apiError(event, error.statusCode, error.code, error.message);
    }
    throw error;
  }
});
