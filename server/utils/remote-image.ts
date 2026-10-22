import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { basename } from 'node:path';

import { MEDIA_MAX_BYTES, MediaUploadError } from './media-storage';

const MAX_REDIRECTS = 3;

export async function downloadRemoteImage(input: string) {
  let url = parseRemoteUrl(input);

  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    await assertPublicHost(url.hostname);
    let response: Response;
    try {
      response = await fetch(url, {
        redirect: 'manual',
        signal: AbortSignal.timeout(8_000),
        headers: { 'user-agent': 'Nookfolio-Media-Importer/1.0' },
      });
    } catch {
      throw new MediaUploadError(
        400,
        'REMOTE_IMAGE_UNAVAILABLE',
        'The online image could not be downloaded',
      );
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location || redirect === MAX_REDIRECTS) {
        throw new MediaUploadError(
          400,
          'REMOTE_REDIRECT_INVALID',
          'The image URL redirected too many times',
        );
      }
      url = parseRemoteUrl(new URL(location, url).toString());
      continue;
    }

    if (!response.ok) {
      throw new MediaUploadError(
        400,
        'REMOTE_IMAGE_UNAVAILABLE',
        'The online image could not be downloaded',
      );
    }
    const declaredSize = Number(response.headers.get('content-length') || 0);
    if (declaredSize > MEDIA_MAX_BYTES) {
      throw new MediaUploadError(413, 'FILE_TOO_LARGE', 'The online image exceeds the 10 MB limit');
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > MEDIA_MAX_BYTES) {
      throw new MediaUploadError(413, 'FILE_TOO_LARGE', 'The online image exceeds the 10 MB limit');
    }
    return {
      buffer,
      originalName: basename(decodeURIComponent(url.pathname)) || 'remote-image',
    };
  }

  throw new MediaUploadError(
    400,
    'REMOTE_IMAGE_UNAVAILABLE',
    'The online image could not be downloaded',
  );
}

function parseRemoteUrl(input: string) {
  const url = new URL(input);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new MediaUploadError(400, 'INVALID_REMOTE_URL', 'Use a public HTTP or HTTPS image URL');
  }
  return url;
}

async function assertPublicHost(hostname: string) {
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    throw new MediaUploadError(
      400,
      'PRIVATE_REMOTE_HOST',
      'Private network image URLs are not allowed',
    );
  }
  const addresses = isIP(hostname)
    ? [{ address: hostname }]
    : await lookup(hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new MediaUploadError(
      400,
      'PRIVATE_REMOTE_HOST',
      'Private network image URLs are not allowed',
    );
  }
}

export function isPrivateAddress(address: string) {
  const normalized = address.toLowerCase();
  if (normalized === '::1' || normalized === '::' || normalized.startsWith('fe80:')) return true;
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
  const ipv4 = normalized.startsWith('::ffff:') ? normalized.slice(7) : normalized;
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(ipv4)) return false;
  const [a = 0, b = 0] = ipv4.split('.').map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  );
}
