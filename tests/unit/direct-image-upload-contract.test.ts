import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('direct image upload admin experience', () => {
  it('removes the standalone media library from the admin product surface', () => {
    expect(existsSync(resolve(root, 'app/pages/admin/media.vue'))).toBe(false);
    expect(read('app/utils/admin-navigation.ts')).not.toContain("'/admin/media'");
  });

  it('uses direct uploads instead of media-library selectors', () => {
    expect(read('app/pages/admin/home.vue')).not.toContain('或从媒体库选择');
    expect(read('app/pages/admin/cv.vue')).not.toMatch(
      /<select v-model="profile\.portraitMediaId"/,
    );
    expect(read('app/pages/admin/links.vue')).not.toMatch(/<select v-model="form\.logoMediaId"/);
    expect(read('app/components/admin/PostEditorFields.vue')).not.toMatch(
      /<select v-model="form\.coverMediaId"/,
    );
    expect(read('app/pages/admin/timeline.vue')).not.toMatch(/<select v-model="form\.mediaIds"/);
  });

  it('provides centered square avatar cropping with zoom and positioning controls', () => {
    const uploader = read('app/components/admin/DirectImageUpload.vue');

    expect(uploader).toContain('默认居中');
    expect(uploader).toContain('调整大小');
    expect(uploader).toContain('拖动图片调整位置');
    expect(uploader).toContain("props.crop === 'square'");
  });

  it('uses the compact uploader inside homepage entry rows', () => {
    const uploader = read('app/components/admin/DirectImageUpload.vue');
    const homeAdmin = read('app/pages/admin/home.vue');

    expect(uploader).toContain('compact?: boolean');
    expect(uploader).toContain("'direct-image-upload--compact': compact");
    expect(uploader).toContain('.direct-image-upload--compact .direct-image-upload__preview');
    expect(homeAdmin).toMatch(/label="入口图标"[\s\S]*?compact/);
  });

  it('accepts SVG files and can import an image from a safe online URL', () => {
    const uploader = read('app/components/admin/DirectImageUpload.vue');

    expect(uploader).toContain('image/svg+xml');
    expect(uploader).toContain('在线链接');
    expect(uploader).toContain('/api/v1/admin/media/import');
  });

  it('shows non-cropped uploads centered without visually clipping them', () => {
    const uploader = read('app/components/admin/DirectImageUpload.vue');

    expect(uploader).toContain("'direct-image-upload--contain': crop === 'none'");
    expect(uploader).toContain('.direct-image-upload--contain .direct-image-upload__preview img');
    expect(uploader).toContain('object-fit: contain');
  });

  it('keeps the regular upload card compact', () => {
    const uploader = read('app/components/admin/DirectImageUpload.vue');

    expect(uploader).toMatch(
      /\.direct-image-upload__card\s*\{[\s\S]*?grid-template-columns:\s*88px 1fr/,
    );
    expect(uploader).toMatch(/\.direct-image-upload__preview\s*\{[\s\S]*?width:\s*88px/);
    expect(uploader).toMatch(/\.direct-image-upload__preview\s*\{[\s\S]*?height:\s*88px/);
  });
});
