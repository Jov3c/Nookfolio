import { defineEventHandler, readBody } from 'h3';
import { verifyLoginSchema } from '#shared/schemas/auth';
import { AdminLoginChallengeError } from '../../../services/admin-login-challenge-service';
import { apiError, authApiError } from '../../../utils/api-response';
import { useAdminLoginChallengeService } from '../../../utils/admin-login-challenge';
import {
  assertSameOrigin,
  consumeVerificationAttempt,
  useAuthService,
  writeSessionCookie,
} from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  try {
    assertSameOrigin(event);
  } catch (error) {
    return authApiError(event, error);
  }
  const limit = consumeVerificationAttempt(event, 'verify');
  if (!limit.allowed) return apiError(event, 429, 'RATE_LIMITED', '尝试次数过多，请稍后再试。');
  const body = verifyLoginSchema.safeParse(await readBody(event));
  if (!body.success) return apiError(event, 400, 'VALIDATION_ERROR', '验证码格式不正确');
  try {
    const admin = await useAdminLoginChallengeService().verify(
      body.data.challengeToken,
      body.data.code,
    );
    const session = await useAuthService().createSession(admin);
    writeSessionCookie(event, session.token, session.expiresAt);
    return { data: { admin: session.admin } };
  } catch (error) {
    if (error instanceof AdminLoginChallengeError)
      return apiError(event, error.statusCode, error.code, error.message);
    return authApiError(event, error);
  }
});
