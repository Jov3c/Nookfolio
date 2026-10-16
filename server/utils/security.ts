import { createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';

import argon2, { type HashOptions } from 'argon2';

const ARGON2_OPTIONS: HashOptions = {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
  hashLength: 32,
};

export async function hashPassword(password: string) {
  return argon2.hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(hash: string, password: string) {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

export function createSessionToken() {
  return randomBytes(32).toString('base64url');
}

export function hashSessionToken(token: string) {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

export function createVerificationToken() {
  return randomBytes(32).toString('base64url');
}

export function hashVerificationToken(token: string) {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

export function createLoginCode() {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}

export function hashLoginCode(challengeToken: string, code: string) {
  return createHash('sha256').update(`${challengeToken}:${code}`, 'utf8').digest('hex');
}

export function loginCodeMatches(expectedHash: string, challengeToken: string, code: string) {
  const actual = Buffer.from(hashLoginCode(challengeToken, code), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
