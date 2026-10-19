import { CommunityRepository } from '../repositories/community-repository';
import { CommunityService } from '../services/community-service';
import type { EmailVerificationService } from '../services/email-verification-service';
import type { CaptchaConsumeInput, CaptchaPurpose } from '../../shared/schemas/captcha';
import { useCaptchaService } from './captcha';
import { usePrisma } from './prisma';

export function useCommunityService(options?: { emailVerification?: EmailVerificationService }) {
  return new CommunityService(new CommunityRepository(usePrisma()), options?.emailVerification);
}

export async function withCommunityCaptcha<T>(
  purpose: CaptchaPurpose,
  captcha: CaptchaConsumeInput,
  ipHash: string,
  action: (service: CommunityService) => Promise<T>,
) {
  return usePrisma().$transaction(async (transaction) => {
    await useCaptchaService(transaction).consume(captcha, purpose, ipHash);
    return action(new CommunityService(new CommunityRepository(transaction)));
  });
}
