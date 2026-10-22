import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  detectImage,
  getMediaStorageRoot,
  resolveStoredMediaPath,
  storeMediaFile,
  prepareImageUpload,
  validateImageUpload,
} from '../../server/utils/media-storage';
import { isPrivateAddress } from '../../server/utils/remote-image';

const onePixelPng = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c6360a0c0000002000100ff0d0a2db40000000049454e44ae426082',
  'hex',
);

describe('media upload security', () => {
  it('detects image type from magic bytes instead of the filename', () => {
    expect(detectImage(onePixelPng)).toMatchObject({
      mimeType: 'image/png',
      extension: 'png',
      width: 1,
      height: 1,
    });
    expect(() => validateImageUpload(onePixelPng, 'not-really-a-document.txt')).not.toThrow();
    expect(validateImageUpload(Buffer.from('<svg viewBox="0 0 24 24"><path d="M0 0"/></svg>'), 'icon.svg'))
      .toMatchObject({ mimeType: 'image/svg+xml', extension: 'svg' });
    expect(() =>
      validateImageUpload(Buffer.from('<svg><script>alert(1)</script></svg>'), 'icon.svg'),
    ).toThrow('unsafe content');
    expect(
      prepareImageUpload(
        Buffer.from('<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/></svg>'),
        'icon.svg',
      ).buffer.toString(),
    ).toContain('<circle');
  });

  it('rejects files above the 10 MB limit and unsafe storage paths', () => {
    expect(() => validateImageUpload(Buffer.alloc(10 * 1024 * 1024 + 1), 'large.png')).toThrow(
      '10 MB limit',
    );
    expect(() =>
      resolveStoredMediaPath('../outside', { MEDIA_STORAGE_ROOT: 'C:\\nookfolio-test' }),
    ).toThrow('Invalid media path');
  });

  it('stores a UUID-based file below the configured persistent root', async () => {
    const root = await mkdtemp(join(tmpdir(), 'nookfolio-media-'));
    try {
      const stored = await storeMediaFile(
        onePixelPng,
        'general',
        validateImageUpload(onePixelPng, 'avatar.png'),
        new Date('2026-09-29T12:00:00.000Z'),
        { MEDIA_STORAGE_ROOT: root },
      );
      expect(stored.storagePath).toMatch(/^general\/2026\/09\/[0-9a-f-]+\.png$/);
      expect(stored.storedName).not.toContain('avatar');
      await expect(readFile(join(root, stored.storagePath))).resolves.toEqual(onePixelPng);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('uses an ignored local equivalent when no storage root is configured', () => {
    expect(getMediaStorageRoot({})).toContain(join('.data', 'uploads'));
  });

  it('blocks loopback and private addresses for online image imports', () => {
    expect(isPrivateAddress('127.0.0.1')).toBe(true);
    expect(isPrivateAddress('10.1.2.3')).toBe(true);
    expect(isPrivateAddress('192.168.1.2')).toBe(true);
    expect(isPrivateAddress('::1')).toBe(true);
    expect(isPrivateAddress('8.8.8.8')).toBe(false);
  });
});
