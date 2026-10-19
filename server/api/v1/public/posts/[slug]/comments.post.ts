import { getRouterParam, readBody, setResponseHeader } from 'h3';

import { commentCreateSchema } from '../../../../../../shared/schemas/community';
import { CommunityError, communityApiError } from '../../../../../services/community-service';
import { CaptchaError } from '../../../../../services/captcha-service';
import { apiError } from '../../../../../utils/api-response';
import { withCommunityCaptcha } from '../../../../../utils/community';
import { getVisitorIpHash } from '../../../../../utils/visitor';
import { SlidingWindowRateLimiter } from '../../../../../utils/rate-limit';

const commentLimiter = new SlidingWindowRateLimiter({
  limit: 5,
  windowMs: 60 * 1_000,
  maxKeys: 20_000,
});

export default defineEventHandler(async (event) => {
  const parsed = commentCreateSchema.safeParse(await readBody(event));
  if (!parsed.success) {
    return apiError(
      event,
      400,
      'VALIDATION_ERROR',
      '评论内容填写不完整或格式不正确。',
      parsed.error.flatten(),
    );
  }

  const limit = commentLimiter.consume(getVisitorIpHash(event));
  if (!limit.allowed) {
    setResponseHeader(event, 'Retry-After', Math.ceil(limit.retryAfterMs / 1_000));
    return apiError(event, 429, 'RATE_LIMITED', '评论提交过于频繁，请稍后再试。');
  }

  const slug = getRouterParam(event, 'slug')?.trim().toLowerCase();
  if (!slug) return apiError(event, 400, 'INVALID_POST_SLUG', '文章路径无效。');

  try {
    const ipHash = getVisitorIpHash(event);
    const result = await withCommunityCaptcha(
      parsed.data.parentId ? 'REPLY' : 'COMMENT',
      { id: parsed.data.captchaChallengeId, answer: parsed.data.captchaAnswer },
      ipHash,
      (service) => service.submitComment(slug, parsed.data, ipHash),
    );
    return { data: result };
  } catch (error) {
    if (error instanceof CaptchaError) {
      return apiError(event, error.statusCode, error.code, error.message);
    }
    if (error instanceof CommunityError) {
      const mapped = communityApiError(error);
      if (mapped) return apiError(event, mapped.statusCode, mapped.code, mapped.message);
      return apiError(event, error.statusCode, error.code, error.message);
    }
    throw error;
  }
});
