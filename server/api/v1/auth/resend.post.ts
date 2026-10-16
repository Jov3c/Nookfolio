import { defineEventHandler, readBody } from 'h3';
import { resendLoginCodeSchema } from '#shared/schemas/auth';
import { AdminLoginChallengeError } from '../../../services/admin-login-challenge-service';
import { apiError, authApiError } from '../../../utils/api-response';
import { useAdminLoginChallengeService } from '../../../utils/admin-login-challenge';
import { assertSameOrigin, consumeVerificationAttempt } from '../../../utils/auth';
import { createSmtpEmailSender, SmtpConfigError } from '../../../utils/smtp';

export default defineEventHandler(async (event) => {
  try {
    assertSameOrigin(event);
  } catch (error) {
    return authApiError(event, error);
  }
  const limit = consumeVerificationAttempt(event, 'resend');
  if (!limit.allowed) return apiError(event, 429, 'RATE_LIMITED', '发送过于频繁，请稍后再试。');
  const body = resendLoginCodeSchema.safeParse(await readBody(event));
  if (!body.success) return apiError(event, 400, 'VALIDATION_ERROR', '登录验证已失效');
  try {
    const { sender } = createSmtpEmailSender();
    const challenge = await useAdminLoginChallengeService().resend(
      body.data.challengeToken,
      sender,
    );
    return { data: challenge };
  } catch (error) {
    if (error instanceof SmtpConfigError || error instanceof AdminLoginChallengeError)
      return apiError(event, 503, 'LOGIN_CODE_UNAVAILABLE', '暂时无法重新发送验证码，请稍后再试。');
    throw error;
  }
});
