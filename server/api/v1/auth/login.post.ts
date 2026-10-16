import { defineEventHandler, readBody, setHeader } from 'h3';

import { loginSchema } from '#shared/schemas/auth';
import { apiError, authApiError } from '../../../utils/api-response';
import { AdminLoginChallengeError } from '../../../services/admin-login-challenge-service';
import { useAdminLoginChallengeService } from '../../../utils/admin-login-challenge';
import { createSmtpEmailSender, SmtpConfigError } from '../../../utils/smtp';
import { assertSameOrigin, consumeLoginAttempt, useAuthService } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    assertSameOrigin(event);
  } catch (error) {
    return authApiError(event, error);
  }

  const limit = consumeLoginAttempt(event);
  setHeader(event, 'X-RateLimit-Remaining', String(limit.remaining));
  if (!limit.allowed) {
    setHeader(event, 'Retry-After', Math.ceil(limit.retryAfterMs / 1_000));
    return apiError(event, 429, 'RATE_LIMITED', 'Too many login attempts');
  }

  const body = loginSchema.safeParse(await readBody(event));
  if (!body.success) {
    return apiError(event, 400, 'VALIDATION_ERROR', '请求参数不正确', body.error.flatten());
  }

  try {
    const admin = await useAuthService().verifyCredentials(body.data.email, body.data.password);
    const { sender } = createSmtpEmailSender();
    const challenge = await useAdminLoginChallengeService().issue(admin, sender);
    return { data: challenge };
  } catch (error) {
    if (error instanceof SmtpConfigError || error instanceof AdminLoginChallengeError) {
      return apiError(event, 503, 'LOGIN_CODE_UNAVAILABLE', '暂时无法发送登录验证码，请稍后再试。');
    }
    return authApiError(event, error);
  }
});
