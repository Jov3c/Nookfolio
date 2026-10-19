import { describe, expect, it } from 'vitest';

import {
  adminReplySchema,
  commentCreateSchema,
  messageCreateSchema,
  moderationStatusUpdateSchema,
} from '../../shared/schemas/community';

describe('community schemas', () => {
  it('normalizes visitor fields and keeps replies optional', () => {
    expect(
      commentCreateSchema.parse({
        nickname: '  示例访客 ',
        email: '',
        content: '  hello <script>alert(1)</script>  ',
        captchaChallengeId: '11111111-1111-4111-8111-111111111111',
        captchaAnswer: ' 7k3m ',
        website: '',
      }),
    ).toMatchObject({
      nickname: '示例访客',
      email: undefined,
      content: 'hello <script>alert(1)</script>',
      parentId: null,
      captchaAnswer: '7k3m',
    });
  });

  it('rejects invalid email, empty text, and visitor message parents', () => {
    expect(() =>
      messageCreateSchema.parse({
        nickname: 'M',
        email: 'bad',
        content: 'x',
        captchaChallengeId: '11111111-1111-4111-8111-111111111111',
        captchaAnswer: '7K3M',
      }),
    ).toThrow();
    expect(() =>
      commentCreateSchema.parse({
        nickname: 'M',
        email: 'm@example.com',
        content: '',
        captchaChallengeId: '11111111-1111-4111-8111-111111111111',
        captchaAnswer: '7K3M',
      }),
    ).toThrow();
    expect(() =>
      commentCreateSchema.parse({
        nickname: 'M',
        email: 'm@example.com',
        content: 'x',
        parentId: 'not-a-uuid',
        captchaChallengeId: '11111111-1111-4111-8111-111111111111',
        captchaAnswer: '7K3M',
      }),
    ).toThrow();
    expect(() =>
      messageCreateSchema.parse({
        nickname: 'M',
        content: 'x',
        captchaChallengeId: '11111111-1111-4111-8111-111111111111',
        captchaAnswer: '7K3M',
        website: 'spam.example',
      }),
    ).toThrow();
  });

  it('defaults messages to public and preserves an explicit whisper choice', () => {
    const input = {
      nickname: 'M',
      email: 'm@example.com',
      content: 'x',
      captchaChallengeId: '11111111-1111-4111-8111-111111111111',
      captchaAnswer: '7K3M',
    };

    expect(messageCreateSchema.parse(input).isPrivate).toBe(false);
    expect(messageCreateSchema.parse({ ...input, isPrivate: true }).isPrivate).toBe(true);
  });

  it('limits moderation actions and admin replies to plain text', () => {
    expect(moderationStatusUpdateSchema.parse({ status: 'HIDDEN' })).toEqual({ status: 'HIDDEN' });
    expect(() => moderationStatusUpdateSchema.parse({ status: 'PENDING_EMAIL' })).toThrow();
    expect(adminReplySchema.parse({ content: '  a reply  ' })).toEqual({ content: 'a reply' });
  });
});
