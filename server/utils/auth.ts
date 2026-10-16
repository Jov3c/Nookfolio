import type { H3Event } from 'h3';
import { deleteCookie, getCookie, getHeader, getRequestIP, setCookie } from 'h3';

import { AuthRepository } from '../repositories/auth-repository';
import { AuthError, AuthService } from '../services/auth-service';
import { usePrisma } from './prisma';
import { SlidingWindowRateLimiter } from './rate-limit';
import { isSameOriginRequest, selectTrustedClientIp } from './request-security';

export const ADMIN_SESSION_COOKIE = 'nookfolio_admin_session';
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

const loginLimiter = new SlidingWindowRateLimiter({
  limit: 5,
  windowMs: 15 * 60 * 1_000,
  maxKeys: 10_000,
});

const verificationLimiter = new SlidingWindowRateLimiter({
  limit: 10,
  windowMs: 15 * 60 * 1_000,
  maxKeys: 10_000,
});

const resendLimiter = new SlidingWindowRateLimiter({
  limit: 3,
  windowMs: 15 * 60 * 1_000,
  maxKeys: 10_000,
});

export function useAuthService() {
  return new AuthService(new AuthRepository(usePrisma()));
}

export function readSessionToken(event: H3Event) {
  return getCookie(event, ADMIN_SESSION_COOKIE);
}

export function writeSessionCookie(event: H3Event, token: string, expires: Date) {
  setCookie(event, ADMIN_SESSION_COOKIE, token, {
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
    expires,
  });
}

export function clearSessionCookie(event: H3Event) {
  deleteCookie(event, ADMIN_SESSION_COOKIE, {
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
}

export function consumeLoginAttempt(event: H3Event) {
  const key = getTrustedClientIp(event);
  return loginLimiter.consume(key);
}

export function consumeVerificationAttempt(event: H3Event, action: 'verify' | 'resend') {
  const ip = getTrustedClientIp(event);
  return (action === 'verify' ? verificationLimiter : resendLimiter).consume(`${ip}:${action}`);
}

export function assertSameOrigin(event: H3Event, options: { required?: boolean } = {}) {
  const origin = getHeader(event, 'origin');
  if (!origin && !options.required) return;

  const host = getHeader(event, 'x-forwarded-host') ?? getHeader(event, 'host');
  if (!isSameOriginRequest(origin, host)) {
    throw new AuthError(403, 'FORBIDDEN_ORIGIN', 'Request origin is not allowed');
  }
}

export function getTrustedClientIp(event: H3Event) {
  return selectTrustedClientIp(
    getHeader(event, 'x-forwarded-for'),
    getRequestIP(event, { xForwardedFor: false }),
  );
}

export async function requireAdmin(event: H3Event) {
  const admin = await useAuthService().resolveSession(readSessionToken(event));
  event.context.admin = admin;
  return admin;
}
