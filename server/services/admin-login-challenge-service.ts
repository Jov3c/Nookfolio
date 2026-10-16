import type { EmailSender } from '../utils/smtp';
import {
  createLoginCode,
  createVerificationToken,
  hashLoginCode,
  hashVerificationToken,
  loginCodeMatches,
} from '../utils/security';

const CHALLENGE_TTL_MS = 5 * 60 * 1_000;
type AdminIdentity = { id: string; email: string; displayName: string };
type ActiveChallenge = {
  id: string;
  codeHash: string;
  attemptsRemaining: number;
  expiresAt: Date;
  admin: AdminIdentity;
};

export interface AdminLoginChallengeRepositoryContract {
  replaceActive(
    input: {
      adminId: string;
      challengeTokenHash: string;
      codeHash: string;
      attemptsRemaining: number;
      expiresAt: Date;
    },
    now: Date,
  ): Promise<{ id: string }>;
  takeAttempt(challengeTokenHash: string, now: Date): Promise<ActiveChallenge | null>;
  consume(id: string, now: Date): Promise<boolean>;
  delete(id: string): Promise<void>;
}

export class AdminLoginChallengeError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AdminLoginChallengeError';
  }
}

export class AdminLoginChallengeService {
  constructor(private readonly repository: AdminLoginChallengeRepositoryContract) {}

  async issue(admin: AdminIdentity, sender: EmailSender, now = new Date()) {
    const challengeToken = createVerificationToken();
    const code = createLoginCode();
    const expiresAt = new Date(now.getTime() + CHALLENGE_TTL_MS);
    const record = await this.repository.replaceActive(
      {
        adminId: admin.id,
        challengeTokenHash: hashVerificationToken(challengeToken),
        codeHash: hashLoginCode(challengeToken, code),
        attemptsRemaining: 5,
        expiresAt,
      },
      now,
    );
    try {
      await sender.send({
        to: admin.email,
        subject: 'Nookfolio 后台登录验证码',
        text: `你的登录验证码是 ${code}。验证码 5 分钟内有效，请勿转发。`,
        html: `<p>你的登录验证码是 <strong>${code}</strong>。</p><p>验证码 5 分钟内有效，请勿转发。</p>`,
      });
    } catch {
      await this.repository.delete(record.id).catch(() => undefined);
      throw new AdminLoginChallengeError(503, 'EMAIL_DELIVERY_FAILED', '验证码发送失败');
    }
    return { challengeToken, expiresAt };
  }

  async verify(challengeToken: string, code: string, now = new Date()) {
    const record = await this.repository.takeAttempt(hashVerificationToken(challengeToken), now);
    if (!record) throw new AdminLoginChallengeError(401, 'INVALID_CHALLENGE', '登录验证已失效');
    if (!/^\d{6}$/.test(code) || !loginCodeMatches(record.codeHash, challengeToken, code)) {
      throw new AdminLoginChallengeError(401, 'INVALID_CODE', '验证码不正确');
    }
    if (!(await this.repository.consume(record.id, now)))
      throw new AdminLoginChallengeError(401, 'INVALID_CHALLENGE', '登录验证已失效');
    return record.admin;
  }

  async resend(challengeToken: string, sender: EmailSender, now = new Date()) {
    const record = await this.repository.takeAttempt(hashVerificationToken(challengeToken), now);
    if (!record) throw new AdminLoginChallengeError(401, 'INVALID_CHALLENGE', '登录验证已失效');
    return this.issue(record.admin, sender, now);
  }
}
