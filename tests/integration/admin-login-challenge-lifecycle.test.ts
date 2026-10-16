import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AdminLoginChallengeRepository } from '../../server/repositories/admin-login-challenge-repository';
import { bootstrapAdmin } from '../../server/services/admin-bootstrap';
import { AdminLoginChallengeService } from '../../server/services/admin-login-challenge-service';
import { createPrismaClient } from '../../server/utils/prisma';
import type { EmailMessage, EmailSender } from '../../server/utils/smtp';

const email = 'admin-otp-integration@example.com';
const databaseUrl = process.env.DATABASE_URL ?? '';
const prisma = createPrismaClient(databaseUrl);

describe('admin login challenge database lifecycle', () => {
  beforeAll(async () => {
    await prisma.adminUser.deleteMany({ where: { email } });
    await bootstrapAdmin(prisma, {
      email,
      password: 'admin-otp-integration-password',
      displayName: 'OTP Integration',
    });
  });

  afterAll(async () => {
    await prisma.adminUser.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it('keeps one active challenge across concurrent issuance', async () => {
    const admin = await prisma.adminUser.findUniqueOrThrow({ where: { email } });
    const service = new AdminLoginChallengeService(new AdminLoginChallengeRepository(prisma));
    const sender: EmailSender = { async send() {} };

    await Promise.all([
      service.issue(admin, sender),
      service.issue(admin, sender),
      service.issue(admin, sender),
    ]);

    await expect(
      prisma.adminLoginChallenge.count({
        where: { adminId: admin.id, consumedAt: null, expiresAt: { gt: new Date() } },
      }),
    ).resolves.toBe(1);
  });

  it('permits only five concurrent code comparisons and consumes a valid code once', async () => {
    const admin = await prisma.adminUser.findUniqueOrThrow({ where: { email } });
    const service = new AdminLoginChallengeService(new AdminLoginChallengeRepository(prisma));
    const messages: EmailMessage[] = [];
    const sender: EmailSender = {
      async send(message) {
        messages.push(message);
      },
    };
    const issued = await service.issue(admin, sender);
    const code = messages[0]?.text.match(/\b\d{6}\b/)?.[0];
    expect(code).toMatch(/^\d{6}$/);
    const wrongCode = code === '000000' ? '000001' : '000000';

    const failures = await Promise.allSettled(
      Array.from({ length: 8 }, () => service.verify(issued.challengeToken, wrongCode)),
    );
    expect(
      failures.filter(
        (result) => result.status === 'rejected' && result.reason?.code === 'INVALID_CODE',
      ),
    ).toHaveLength(5);
    await expect(service.verify(issued.challengeToken, code!)).rejects.toMatchObject({
      code: 'INVALID_CHALLENGE',
    });

    const freshMessages: EmailMessage[] = [];
    const fresh = await service.issue(admin, {
      async send(message) {
        freshMessages.push(message);
      },
    });
    const freshCode = freshMessages[0]?.text.match(/\b\d{6}\b/)?.[0];
    const concurrentSuccesses = await Promise.allSettled(
      Array.from({ length: 4 }, () => service.verify(fresh.challengeToken, freshCode!)),
    );
    expect(concurrentSuccesses.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(
      concurrentSuccesses.filter(
        (result) => result.status === 'rejected' && result.reason?.code === 'INVALID_CHALLENGE',
      ),
    ).toHaveLength(3);
  });
});
