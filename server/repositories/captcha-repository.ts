import type { PrismaClient } from '../generated/prisma/client';

import type { CaptchaPurpose } from '../../shared/schemas/captcha';

export interface CaptchaChallengeCreateInput {
  purpose: CaptchaPurpose;
  answerHash: string;
  ipHash: string;
  expiresAt: Date;
}

export interface CaptchaConsumeInput {
  id: string;
  purpose: CaptchaPurpose;
  answerHash: string;
  ipHash: string;
  now: Date;
}

export interface CaptchaChallengeRepositoryContract {
  create(input: CaptchaChallengeCreateInput): Promise<{ id: string; expiresAt: Date }>;
  consume(input: CaptchaConsumeInput): Promise<boolean>;
  deleteExpired(now: Date): Promise<number>;
}

type CaptchaPrisma = Pick<PrismaClient, 'captchaChallenge'>;

export class CaptchaChallengeRepository implements CaptchaChallengeRepositoryContract {
  constructor(private readonly prisma: CaptchaPrisma) {}

  create(input: CaptchaChallengeCreateInput) {
    return this.prisma.captchaChallenge.create({ data: input });
  }

  async consume(input: CaptchaConsumeInput) {
    const result = await this.prisma.captchaChallenge.updateMany({
      where: {
        id: input.id,
        purpose: input.purpose,
        answerHash: input.answerHash,
        ipHash: input.ipHash,
        expiresAt: { gt: input.now },
        consumedAt: null,
      },
      data: { consumedAt: input.now },
    });
    return result.count === 1;
  }

  async deleteExpired(now: Date) {
    const result = await this.prisma.captchaChallenge.deleteMany({
      where: { expiresAt: { lte: now } },
    });
    return result.count;
  }
}
