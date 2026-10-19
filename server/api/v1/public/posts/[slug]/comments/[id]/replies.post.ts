import { getRouterParam, readBody, setResponseHeader } from 'h3';

import { commentCreateSchema } from '../../../../../../../../shared/schemas/community';
import { CaptchaError } from '../../../../../../../services/captcha-service';
import { CommunityError, communityApiError } from '../../../../../../../services/community-service';
import { apiError } from '../../../../../../../utils/api-response';
import { withCommunityCaptcha } from '../../../../../../../utils/community';
import { SlidingWindowRateLimiter } from '../../../../../../../utils/rate-limit';
import { getVisitorIpHash } from '../../../../../../../utils/visitor';

const replyLimiter = new SlidingWindowRateLimiter({ limit: 5, windowMs: 60_000, maxKeys: 20_000 });

export default defineEventHandler(async (event) => {
  const parentId = getRouterParam(event, 'id');
  const slug = getRouterParam(event, 'slug')?.trim().toLowerCase();
  const parsed = commentCreateSchema.safeParse({ ...(await readBody(event)), parentId });
  if (!slug || !parsed.success) {
    return apiError(event, 400, 'VALIDATION_ERROR', '回复内容或目标无效。');
  }
  const ipHash = getVisitorIpHash(event);
  const limit = replyLimiter.consume(ipHash);
  if (!limit.allowed) {
    setResponseHeader(event, 'Retry-After', Math.ceil(limit.retryAfterMs / 1_000));
    return apiError(event, 429, 'RATE_LIMITED', '回复过于频繁，请稍后再试。');
  }
  try {
    return {
      data: await withCommunityCaptcha(
        'REPLY',
        { id: parsed.data.captchaChallengeId, answer: parsed.data.captchaAnswer },
        ipHash,
        (service) => service.submitComment(slug, parsed.data, ipHash),
      ),
    };
  } catch (error) {
    if (error instanceof CaptchaError)
      return apiError(event, error.statusCode, error.code, error.message);
    if (error instanceof CommunityError) {
      const mapped = communityApiError(error);
      if (mapped) return apiError(event, mapped.statusCode, mapped.code, mapped.message);
      return apiError(event, error.statusCode, error.code, error.message);
    }
    throw error;
  }
});
