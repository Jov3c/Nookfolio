import { describe, expect, it } from 'vitest';

import {
  AdminLoginChallengeError,
  AdminLoginChallengeService,
  type AdminLoginChallengeRepositoryContract,
} from '../../server/services/admin-login-challenge-service';
import type { EmailMessage, EmailSender } from '../../server/utils/smtp';

type TestChallengeRecord = {
  id: string;
  adminId: string;
  challengeTokenHash: string;
  codeHash: string;
  attemptsRemaining: number;
  expiresAt: Date;
  consumedAt: Date | null;
  admin: { id: string; email: string; displayName: string };
};

function setup() {
  let record: TestChallengeRecord | null = null;
  const sent: EmailMessage[] = [];
  const repository: AdminLoginChallengeRepositoryContract = {
    async replaceActive(input) {
      if (record) record.consumedAt = new Date();
      record = {
        id: 'challenge-id',
        ...input,
        consumedAt: null,
        admin: { id: input.adminId, email: 'admin@example.com', displayName: 'Admin' },
      };
      return { id: record.id };
    },
    async takeAttempt(tokenHash, now) {
      const active =
        record &&
        record.challengeTokenHash === tokenHash &&
        !record.consumedAt &&
        record.expiresAt > now &&
        record.attemptsRemaining > 0
          ? record
          : null;
      if (active) active.attemptsRemaining -= 1;
      return active;
    },
    async consume(id, now) {
      if (
        record?.id !== id ||
        record.consumedAt ||
        record.expiresAt <= now ||
        record.attemptsRemaining < 0
      )
        return false;
      record.consumedAt = now;
      return true;
    },
    async delete(id) {
      if (record?.id === id) record = null;
    },
  };
  const sender: EmailSender = {
    async send(message) {
      sent.push(message);
    },
  };
  return {
    service: new AdminLoginChallengeService(repository),
    sender,
    sent,
    getRecord: () => record,
  };
}

describe('admin login challenge service', () => {
  it('stores hashes only and consumes a six-digit code once', async () => {
    const context = setup();
    const issued = await context.service.issue(
      { id: 'admin-id', email: 'admin@example.com', displayName: 'Admin' },
      context.sender,
      new Date('2026-10-16T00:00:00Z'),
    );
    expect(issued.challengeToken).not.toMatch(/^\d{6}$/);
    expect(context.getRecord().challengeTokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(context.getRecord().codeHash).toMatch(/^[a-f0-9]{64}$/);
    expect(context.sent[0]?.to).toBe('admin@example.com');
    const code = context.sent[0]?.text.match(/\b\d{6}\b/)?.[0];
    expect(code).toMatch(/^\d{6}$/);
    await expect(
      context.service.verify(issued.challengeToken, code!, new Date('2026-10-16T00:01:00Z')),
    ).resolves.toMatchObject({ email: 'admin@example.com' });
    await expect(
      context.service.verify(issued.challengeToken, code!, new Date('2026-10-16T00:02:00Z')),
    ).rejects.toBeInstanceOf(AdminLoginChallengeError);
  });

  it('expires after five minutes and rejects after five wrong attempts', async () => {
    const context = setup();
    const issued = await context.service.issue(
      { id: 'admin-id', email: 'admin@example.com', displayName: 'Admin' },
      context.sender,
      new Date('2026-10-16T00:00:00Z'),
    );
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(
        context.service.verify(issued.challengeToken, '000000', new Date('2026-10-16T00:01:00Z')),
      ).rejects.toMatchObject({ code: 'INVALID_CODE' });
    }
    await expect(
      context.service.verify(issued.challengeToken, '000000', new Date('2026-10-16T00:01:00Z')),
    ).rejects.toMatchObject({ code: 'INVALID_CHALLENGE' });

    const next = await context.service.issue(
      { id: 'admin-id', email: 'admin@example.com', displayName: 'Admin' },
      context.sender,
      new Date('2026-10-16T01:00:00Z'),
    );
    await expect(
      context.service.verify(next.challengeToken, '000000', new Date('2026-10-16T01:05:01Z')),
    ).rejects.toMatchObject({ code: 'INVALID_CHALLENGE' });
  });
});
