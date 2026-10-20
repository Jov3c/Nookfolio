import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('admin design contract', () => {
  it('uses a small entry stylesheet with focused admin modules', () => {
    const layout = read('app/layouts/admin.vue');
    const css = read('app/assets/css/admin.css');
    const modules = ['auth', 'shell', 'forms', 'content', 'islands', 'responsive'];

    expect(layout).toContain('<style src="~/assets/css/admin.css"></style>');
    expect(layout).not.toContain('admin-shell.css');
    expect(existsSync(resolve(root, 'app/assets/css/admin-shell.css'))).toBe(false);
    for (const module of modules) {
      const modulePath = `app/assets/css/admin/${module}.css`;
      expect(css).toContain(`@import './admin/${module}.css';`);
      expect(existsSync(resolve(root, modulePath))).toBe(true);
      expect(read(modulePath).split('\n').length).toBeLessThan(720);
    }
    expect(css.split('\n').length).toBeLessThan(20);
  });

  it('uses the approved floating top navigation workspace', () => {
    const layout = read('app/layouts/admin.vue');
    const shellCss = read('app/assets/css/admin/shell.css');

    expect(layout).toContain('<SiteBrand');
    expect(layout).toContain('aria-label="返回概览仪表盘"');
    expect(layout).toContain('<AdminPrimaryNav');
    expect(layout).toContain('<AdminSecondaryNav');
    expect(layout).not.toContain('admin-sidebar');
    expect(shellCss).toContain('.admin-floating-bar');
    expect(shellCss).toContain('var(--color-bg)');
    expect(shellCss).toContain('var(--color-panel)');
    expect(shellCss).toContain('var(--color-accent)');
    expect(shellCss).not.toContain('#f5f7fa');
    expect(shellCss).not.toContain('#303133');
  });

  it('uses floating islands without the retired paper theme', () => {
    const shellCss = read('app/assets/css/admin/shell.css');
    const islandsCss = read('app/assets/css/admin/islands.css');
    const responsiveCss = read('app/assets/css/admin/responsive.css');
    const authCss = read('app/assets/css/admin/auth.css');
    const aboutPage = read('app/pages/admin/about.vue');

    expect(shellCss).toContain('grid-template-columns: minmax(150px, 1fr) auto minmax(150px, 1fr)');
    expect(existsSync(resolve(root, 'app/assets/css/admin/paper.css'))).toBe(false);
    expect(islandsCss).toContain('.admin-island');
    expect(islandsCss).toContain('border-radius: var(--radius-lg)');
    expect(islandsCss).not.toMatch(/tape|rotate\(|Courier New|Georgia/);
    expect(islandsCss).toContain("html[data-theme='dark']");
    expect(islandsCss).toContain('.admin-main');
    expect(responsiveCss).not.toContain('font-size: 2.65rem');
    expect(authCss).toContain('font-size: clamp(1.75rem, 4vw, 2.6rem)');
    expect(aboutPage).toContain('<header class="admin-page-heading">');
    expect(aboutPage).toContain('class="home-admin-section about-admin-form-grid"');
    expect(aboutPage).not.toContain('admin-page-header');
    expect(aboutPage).not.toContain('class="admin-panel');
  });

  it('keeps long indexes usable before editors on narrow screens', () => {
    const responsiveCss = read('app/assets/css/admin/responsive.css');

    expect(responsiveCss).toContain('.posts-admin-list-panel');
    expect(responsiveCss).toContain('max-height: 430px');
    expect(responsiveCss).toContain('overflow: auto');
  });

  it('keeps long markdown articles inside a stable split editor viewport', () => {
    const contentCss = read('app/assets/css/admin/content.css');

    expect(contentCss).toContain('.project-editor__markdown-grid');
    expect(contentCss).toContain('align-items: start');
    expect(contentCss).toContain('height: clamp(420px, 62vh, 680px)');
    expect(contentCss).toContain('overflow: auto');
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
