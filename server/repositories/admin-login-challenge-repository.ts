import type { PrismaClient } from '../generated/prisma/client';
import type { AdminLoginChallengeRepositoryContract } from '../services/admin-login-challenge-service';

export class AdminLoginChallengeRepository implements AdminLoginChallengeRepositoryContract {
  constructor(private readonly prisma: PrismaClient) {}
  async replaceActive(
    input: {
      adminId: string;
      challengeTokenHash: string;
      codeHash: string;
      attemptsRemaining: number;
      expiresAt: Date;
    },
    now: Date,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`
        SELECT pg_advisory_xact_lock(hashtext(${input.adminId})) IS NULL AS "lockAcquired"
      `;
      await tx.adminLoginChallenge.updateMany({
        where: { adminId: input.adminId, consumedAt: null, expiresAt: { gt: now } },
        data: { consumedAt: now },
      });
      return tx.adminLoginChallenge.create({ data: input, select: { id: true } });
    });
  }
  async takeAttempt(challengeTokenHash: string, now: Date) {
    return this.prisma.$transaction(async (tx) => {
      const records = await tx.$queryRaw<
        Array<{
          id: string;
          codeHash: string;
          attemptsRemaining: number;
          expiresAt: Date;
          adminId: string;
          adminEmail: string;
          adminDisplayName: string;
        }>
      >`
        SELECT c."id", c."code_hash" AS "codeHash",
               c."attempts_remaining" AS "attemptsRemaining", c."expires_at" AS "expiresAt",
               a."id" AS "adminId", a."email" AS "adminEmail",
               a."display_name" AS "adminDisplayName"
        FROM "admin_login_challenges" c
        JOIN "admin_users" a ON a."id" = c."admin_id"
        WHERE c."challenge_token_hash" = ${challengeTokenHash}
          AND c."consumed_at" IS NULL
          AND c."expires_at" > ${now}
          AND c."attempts_remaining" > 0
        FOR UPDATE OF c
      `;
      const record = records[0];
      if (!record) return null;
      await tx.adminLoginChallenge.update({
        where: { id: record.id },
        data: { attemptsRemaining: { decrement: 1 } },
      });
      return {
        id: record.id,
        codeHash: record.codeHash,
        attemptsRemaining: record.attemptsRemaining,
        expiresAt: record.expiresAt,
        admin: {
          id: record.adminId,
          email: record.adminEmail,
          displayName: record.adminDisplayName,
        },
      };
    });
  }
  async consume(id: string, now: Date) {
    const result = await this.prisma.adminLoginChallenge.updateMany({
      where: { id, consumedAt: null, expiresAt: { gt: now } },
      data: { consumedAt: now },
    });
    return result.count === 1;
  }
  async delete(id: string) {
    await this.prisma.adminLoginChallenge.deleteMany({ where: { id } });
  }
}
