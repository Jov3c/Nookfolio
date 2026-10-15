import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('admin design contract', () => {
  it('uses a small entry stylesheet with focused admin modules', () => {
    const layout = read('app/layouts/admin.vue');
    const css = read('app/assets/css/admin.css');
    const modules = ['auth', 'shell', 'forms', 'content', 'responsive'];

    expect(layout).toContain('<style src="~/assets/css/admin.css"></style>');
    expect(layout).not.toContain('admin-shell.css');
    expect(existsSync(resolve(root, 'app/assets/css/admin-shell.css'))).toBe(false);
    for (const module of modules) {
      const modulePath = `app/assets/css/admin/${module}.css`;
      expect(css).toContain(`@import './admin/${module}.css';`);
      expect(existsSync(resolve(root, modulePath))).toBe(true);
      expect(read(modulePath).split('\n').length).toBeLessThan(700);
    }
    expect(css.split('\n').length).toBeLessThan(20);
  });

  it('uses the approved restrained sidebar workspace', () => {
    const layout = read('app/layouts/admin.vue');
    const shellCss = read('app/assets/css/admin/shell.css');

    expect(layout).toContain('<SiteBrand');
    expect(layout).toContain('aria-label="返回概览仪表盘"');
    expect(layout).not.toContain('admin-collapse-button');
    expect(layout).toContain(':aria-label="item.label"');
    expect(layout).toContain('aria-controls="admin-sidebar"');
    expect(layout).toContain(':aria-expanded="isMobileOpen"');
    expect(shellCss).toContain('grid-template-columns: 224px minmax(0, 1fr)');
    expect(shellCss).toContain('var(--color-bg)');
    expect(shellCss).toContain('var(--color-panel)');
    expect(shellCss).toContain('var(--color-accent)');
    expect(shellCss).not.toContain('#f5f7fa');
    expect(shellCss).not.toContain('#303133');
  });

  it('keeps long indexes usable before editors on narrow screens', () => {
    const responsiveCss = read('app/assets/css/admin/responsive.css');

    expect(responsiveCss).toContain('.posts-admin-list-panel');
    expect(responsiveCss).toContain('max-height: 430px');
    expect(responsiveCss).toContain('overflow: auto');
  });

  it('supports direct avatar upload and respects empty homepage entry icons', () => {
    const adminHome = read('app/pages/admin/home.vue');
    const publicHome = read('app/pages/index.vue');

    expect(adminHome).toContain('id="home-avatar-file"');
    expect(adminHome).toContain("body.append('category', 'avatars')");
    expect(adminHome).toContain('uploadAvatar');
    expect(publicHome).toContain('v-else-if="entryIconText(item)"');
    expect(publicHome).not.toContain("item.icon || '↗'");
  });

  it('supports uploaded and remote homepage icons without hiding entries after the fourth', () => {
    const adminHome = read('app/pages/admin/home.vue');
    const publicHome = read('app/pages/index.vue');
    const publicCss = read('app/assets/css/public.css');

    expect(adminHome).toContain("body.append('category', 'icons')");
    expect(adminHome).toContain('uploadEntryIcon');
    expect(publicHome).toContain('entryIconUrl(item)');
    expect(publicHome).toContain("key: 'public-home-page'");
    expect(publicHome).toContain("'--entry-index': index");
    expect(publicCss).toContain('animation-delay: calc(var(--entry-index) * 0.06s + 0.36s)');
    expect(publicCss).not.toContain('.home-prototype__entry:nth-child(4)');
  });
});
