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
});
