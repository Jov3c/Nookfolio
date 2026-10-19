import { randomUUID } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import type {
  CaptchaChallengeCreateInput,
  CaptchaChallengeRepositoryContract,
  CaptchaConsumeInput,
} from '../../server/repositories/captcha-repository';
import {
  CAPTCHA_TTL_MS,
  CaptchaError,
  CaptchaService,
} from '../../server/services/captcha-service';

interface MemoryChallenge extends CaptchaChallengeCreateInput {
  id: string;
  consumedAt: Date | null;
}

class MemoryCaptchaRepository implements CaptchaChallengeRepositoryContract {
  records: MemoryChallenge[] = [];

  async create(input: CaptchaChallengeCreateInput) {
    const record = { ...input, id: randomUUID(), consumedAt: null };
    this.records.push(record);
    return record;
  }

  async consume(input: CaptchaConsumeInput) {
    const record = this.records.find(
      (entry) =>
        entry.id === input.id &&
        entry.purpose === input.purpose &&
        entry.ipHash === input.ipHash &&
        entry.answerHash === input.answerHash &&
        entry.expiresAt > input.now &&
        entry.consumedAt === null,
    );
    if (!record) return false;
    record.consumedAt = input.now;
    return true;
  }

  async deleteExpired(now: Date) {
    const retained = this.records.filter((entry) => entry.expiresAt > now);
    const deleted = this.records.length - retained.length;
    this.records = retained;
    return deleted;
  }
}

function createFixture() {
  const repository = new MemoryCaptchaRepository();
  const service = new CaptchaService(repository, 'test-secret-with-enough-entropy', () => '7K3M');
  const now = new Date('2026-10-19T08:00:00.000Z');
  return { repository, service, now };
}

describe('captcha service', () => {
  it('issues an SVG challenge without storing or exposing the plain answer', async () => {
    const { repository, service, now } = createFixture();

    const challenge = await service.issue('COMMENT', 'ip-hash-a', now);

    expect(challenge.image).toMatch(/^data:image\/svg\+xml;base64,/);
    expect(challenge.expiresAt).toEqual(new Date(now.getTime() + CAPTCHA_TTL_MS));
    expect(JSON.stringify(challenge)).not.toContain('7K3M');
    expect(repository.records[0]!.answerHash).not.toBe('7K3M');
  });

  it.each([
    ['wrong answer', { answer: 'ABCD' }],
    ['wrong purpose', { purpose: 'MESSAGE' as const }],
    ['wrong ip', { ipHash: 'ip-hash-b' }],
    ['expired challenge', { nowOffset: CAPTCHA_TTL_MS + 1 }],
  ])('rejects %s', async (_label, override) => {
    const { service, now } = createFixture();
    const challenge = await service.issue('COMMENT', 'ip-hash-a', now);

    await expect(
      service.consume(
        {
          id: challenge.id,
          answer: override.answer ?? '7K3M',
        },
        override.purpose ?? 'COMMENT',
        override.ipHash ?? 'ip-hash-a',
        new Date(now.getTime() + (override.nowOffset ?? 1_000)),
      ),
    ).rejects.toBeInstanceOf(CaptchaError);
  });

  it('consumes a challenge only once even when requests race', async () => {
    const { service, now } = createFixture();
    const challenge = await service.issue('REPLY', 'ip-hash-a', now);
    const consume = () =>
      service.consume(
        { id: challenge.id, answer: ' 7k3m ' },
        'REPLY',
        'ip-hash-a',
        new Date(now.getTime() + 1_000),
      );

    const results = await Promise.allSettled([consume(), consume()]);

    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((result) => result.status === 'rejected')).toHaveLength(1);
  });

  it('removes expired challenges when issuing a new one', async () => {
    const { repository, service, now } = createFixture();
    await service.issue('COMMENT', 'ip-hash-a', now);

    await service.issue('COMMENT', 'ip-hash-a', new Date(now.getTime() + CAPTCHA_TTL_MS + 1));

    expect(repository.records).toHaveLength(1);
  });
});
