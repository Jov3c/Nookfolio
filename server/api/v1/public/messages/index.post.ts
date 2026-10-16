import { readBody, setResponseHeader } from 'h3';

import { messageCreateSchema } from '../../../../../shared/schemas/community';
import { CommunityError, communityApiError } from '../../../../services/community-service';
import { apiError } from '../../../../utils/api-response';
import { useCommunityService } from '../../../../utils/community';
import { getVisitorIpHash } from '../../../../utils/visitor';
import { SlidingWindowRateLimiter } from '../../../../utils/rate-limit';

const messageLimiter = new SlidingWindowRateLimiter({
  limit: 5,
  windowMs: 60 * 1_000,
  maxKeys: 20_000,
});

export default defineEventHandler(async (event) => {
  const parsed = messageCreateSchema.safeParse(await readBody(event));
  if (!parsed.success) {
    return apiError(
      event,
      400,
      'VALIDATION_ERROR',
      'Message fields are invalid',
      parsed.error.flatten(),
    );
  }

  const limit = messageLimiter.consume(getVisitorIpHash(event));
  if (!limit.allowed) {
    setResponseHeader(event, 'Retry-After', Math.ceil(limit.retryAfterMs / 1_000));
    return apiError(event, 429, 'RATE_LIMITED', 'Too many messages submitted');
  }

  try {
    const result = await useCommunityService().submitMessage(parsed.data, getVisitorIpHash(event));
    return { data: result };
  } catch (error) {
    if (error instanceof CommunityError) {
      const mapped = communityApiError(error);
      if (mapped) return apiError(event, mapped.statusCode, mapped.code, mapped.message);
      return apiError(event, error.statusCode, error.code, error.message);
    }
    throw error;
  }
});
