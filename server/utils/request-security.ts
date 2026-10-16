import { isIP } from 'node:net';

export function selectTrustedClientIp(
  forwardedFor: string | undefined,
  directAddress: string | undefined,
) {
  const proxyAppendedAddress = forwardedFor
    ?.split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .at(-1);

  if (proxyAppendedAddress && isIP(proxyAppendedAddress)) return proxyAppendedAddress;
  if (directAddress && isIP(directAddress)) return directAddress;
  return 'unknown';
}

export function isSameOriginRequest(origin: string | undefined, host: string | undefined) {
  if (!origin || !host) return false;
  try {
    return new URL(origin).host.toLowerCase() === host.trim().toLowerCase();
  } catch {
    return false;
  }
}
