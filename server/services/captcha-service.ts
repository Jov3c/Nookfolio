import { createHmac, randomInt } from 'node:crypto';

import type { CaptchaChallengeRepositoryContract } from '../repositories/captcha-repository';
import {
  captchaConsumeSchema,
  type CaptchaConsumeInput,
  type CaptchaPurpose,
} from '../../shared/schemas/captcha';

export const CAPTCHA_TTL_MS = 5 * 60 * 1_000;
const CAPTCHA_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export class CaptchaError extends Error {
  readonly statusCode = 400;
  readonly code = 'INVALID_OR_EXPIRED_CAPTCHA';

  constructor() {
    super('验证码错误或已过期，请刷新后重试。');
    this.name = 'CaptchaError';
  }
}

export class CaptchaService {
  constructor(
    private readonly repository: CaptchaChallengeRepositoryContract,
    private readonly secret: string,
    private readonly codeGenerator: () => string = generateCaptchaCode,
  ) {
    if (secret.length < 16) throw new Error('CAPTCHA_SECRET must contain at least 16 characters');
  }

  async issue(purpose: CaptchaPurpose, ipHash: string, now = new Date()) {
    const answer = normalizeCaptchaAnswer(this.codeGenerator());
    const expiresAt = new Date(now.getTime() + CAPTCHA_TTL_MS);
    const challenge = await this.repository.create({
      purpose,
      answerHash: hashCaptchaAnswer(answer, this.secret, purpose, ipHash),
      ipHash,
      expiresAt,
    });
    return {
      id: challenge.id,
      image: renderCaptchaDataUrl(answer),
      expiresAt: challenge.expiresAt,
    };
  }

  async consume(
    input: CaptchaConsumeInput,
    purpose: CaptchaPurpose,
    ipHash: string,
    now = new Date(),
  ) {
    const parsed = captchaConsumeSchema.safeParse(input);
    if (!parsed.success) throw new CaptchaError();
    const consumed = await this.repository.consume({
      id: parsed.data.id,
      purpose,
      ipHash,
      answerHash: hashCaptchaAnswer(parsed.data.answer, this.secret, purpose, ipHash),
      now,
    });
    if (!consumed) throw new CaptchaError();
    return { consumed: true } as const;
  }
}

export function normalizeCaptchaAnswer(value: string) {
  return value.trim().toUpperCase();
}

export function hashCaptchaAnswer(
  answer: string,
  secret: string,
  purpose: CaptchaPurpose,
  ipHash: string,
) {
  return createHmac('sha256', secret)
    .update(`${purpose}:${ipHash}:${normalizeCaptchaAnswer(answer)}`, 'utf8')
    .digest('hex');
}

function generateCaptchaCode() {
  return Array.from({ length: 4 }, () => CAPTCHA_ALPHABET[randomInt(CAPTCHA_ALPHABET.length)]).join(
    '',
  );
}

function renderCaptchaDataUrl(answer: string) {
  const rotations = [-7, 5, -3, 7];
  const glyphs = [...answer]
    .map(
      (character, index) =>
        `<text x="${31 + index * 30}" y="42" transform="rotate(${rotations[index]} ${
          31 + index * 30
        } 42)">${character}</text>`,
    )
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="164" height="52" viewBox="0 0 164 52"><rect width="164" height="52" rx="8" fill="#e9ece5"/><g stroke="#7c8874" stroke-opacity=".24"><path d="M6 15L158 39M12 43L151 8M2 29L162 20"/></g><g fill="#354032" font-family="ui-monospace,monospace" font-size="28" font-weight="700">${glyphs}</g><g fill="#596653" fill-opacity=".32"><circle cx="19" cy="9" r="1.5"/><circle cx="143" cy="14" r="1.5"/><circle cx="112" cy="47" r="1.5"/><circle cx="52" cy="6" r="1.5"/></g></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
}
