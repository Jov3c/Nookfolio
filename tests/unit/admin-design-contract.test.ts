import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('admin design contract', () => {
  it('uses a small entry stylesheet with focused admin modules', () => {
    const layout = read('app/layouts/admin.vue');
    const css = read('app/assets/css/admin.css');
    const modules = [
      'auth',
      'shell',
      'forms',
      'content',
      'management',
      'dashboard',
      'islands',
      'responsive',
    ];

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

  it('uses the approved editorial top navigation and indexed workspace', () => {
    const layout = read('app/layouts/admin.vue');
    const shellCss = read('app/assets/css/admin/shell.css');

    expect(layout).toContain('<SiteBrand');
    expect(layout).toContain('aria-label="返回概览仪表盘"');
    expect(layout).toContain('<AdminPrimaryNav');
    expect(layout).toContain('<AdminSecondaryNav');
    expect(layout).not.toContain('admin-sidebar');
    expect(shellCss).toContain('.admin-topbar');
    expect(layout).toContain('admin-workspace');
    expect(layout).toContain('admin-workspace__index');
    expect(layout).toContain('admin-workspace__content');
    expect(shellCss).toContain('var(--color-bg)');
    expect(shellCss).toContain('var(--color-panel)');
    expect(shellCss).toContain('var(--color-accent)');
    expect(shellCss).not.toContain('#f5f7fa');
    expect(shellCss).not.toContain('#303133');
    expect(shellCss).toContain('.sr-only');
    expect(layout).toContain('aria-controls="admin-primary-navigation"');
    expect(layout).toContain("isMobileOpen ? '关闭导航' : '打开导航'");
    expect(layout).toContain('primaryNav.value?.focusFirst()');
  });

  it('uses editorial surfaces without the retired paper theme', () => {
    const shellCss = read('app/assets/css/admin/shell.css');
    const islandsCss = read('app/assets/css/admin/islands.css');
    const responsiveCss = read('app/assets/css/admin/responsive.css');
    const authCss = read('app/assets/css/admin/auth.css');
    const aboutPage = read('app/pages/admin/about.vue');

    expect(shellCss).toContain('grid-template-columns: 190px minmax(0, 1fr)');
    expect(existsSync(resolve(root, 'app/assets/css/admin/paper.css'))).toBe(false);
    expect(islandsCss).toContain('.admin-island');
    expect(islandsCss).toContain('border-radius: 12px');
    expect(islandsCss).not.toMatch(/tape|rotate\(|Courier New/);
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

  it('builds the overview around core metrics, writing, recent work and pending actions', () => {
    const dashboard = read('app/pages/admin/index.vue');
    const contentCss = read('app/assets/css/admin/dashboard.css');

    for (const area of ['metrics', 'writing', 'recent', 'pending', 'health']) {
      expect(dashboard).toContain(`admin-dashboard-panel--${area}`);
      expect(contentCss).toContain(`grid-area: ${area}`);
    }
    expect(dashboard).toContain('已发布文章');
    expect(dashboard).toContain('草稿');
    expect(dashboard).toContain('待处理互动');
    expect(dashboard).toContain('继续写作');
    expect(dashboard).toContain('最近翻阅');
    expect(dashboard).toContain('暂无草稿，开始写一篇新文章');
    expect(dashboard).not.toMatch(/Math\.random|假数据|模拟数据/);
  });

  it('keeps long markdown articles inside a stable split editor viewport', () => {
    const contentCss = read('app/assets/css/admin/content.css');

    expect(contentCss).toContain('.project-editor__markdown-grid');
    expect(contentCss).toContain('align-items: start');
    expect(contentCss).toContain('height: clamp(480px, 66vh, 760px)');
    expect(contentCss).toContain('overflow: auto');
  });

  it('supports direct avatar upload and respects empty homepage entry icons', () => {
    const adminHome = read('app/pages/admin/home.vue');
    const uploader = read('app/components/admin/DirectImageUpload.vue');
    const publicHome = read('app/pages/index.vue');

    expect(adminHome).toContain('<AdminDirectImageUpload');
    expect(adminHome).toContain('crop="square"');
    expect(uploader).toContain("body.append('category', props.category)");
    expect(publicHome).toContain('v-else-if="entryIconText(item)"');
    expect(publicHome).toContain('if (!item.icon) return null;');
  });

  it('keeps every admin workflow in the shared heading and island system', () => {
    const pages = [
      'write.vue',
      'write/drafts.vue',
      'posts.vue',
      'categories.vue',
      'projects.vue',
      'timeline.vue',
      'home.vue',
      'cv.vue',
      'about.vue',
      'comments.vue',
      'messages.vue',
      'links.vue',
    ];

    for (const page of pages) {
      const source = read(`app/pages/admin/${page}`);
      expect(source).toContain('admin-page-heading');
      expect(source).toMatch(/home-admin-section|moderation-card|friend-link-|media-/);
    }
    expect(read('app/pages/admin/write.vue')).toContain('@submit.prevent="publishPost"');
    expect(read('app/pages/admin/write/drafts.vue')).toContain('draft-list');
    expect(read('app/pages/admin/posts.vue')).toContain('@submit.prevent="savePost"');
  });

  it('gives writing and profile workflows a compact editorial document frame', () => {
    const islandsCss = read('app/assets/css/admin/islands.css');
    const formsCss = read('app/assets/css/admin/forms.css');
    const contentCss = read('app/assets/css/admin/content.css');
    const editorialPages = [
      'write.vue',
      'write/drafts.vue',
      'projects.vue',
      'home.vue',
      'cv.vue',
      'about.vue',
    ];

    for (const page of editorialPages) {
      expect(read(`app/pages/admin/${page}`)).toContain('admin-editorial-page');
    }
    expect(islandsCss).toContain("font-family: Georgia, 'Songti SC', serif");
    expect(islandsCss).toContain('border-radius: 12px');
    expect(formsCss).toContain('min-height: 42px');
    expect(contentCss).toContain('height: clamp(480px, 66vh, 760px)');
  });

  it('keeps management and moderation records in compact scannable rows', () => {
    const contentCss = read('app/assets/css/admin/management.css');
    const pages = [
      'posts.vue',
      'categories.vue',
      'timeline.vue',
      'comments.vue',
      'messages.vue',
      'links.vue',
    ];

    for (const page of pages) {
      expect(read(`app/pages/admin/${page}`)).toContain('admin-management-page');
    }
    expect(contentCss).toContain('.admin-management-page');
    expect(contentCss).toContain('border-radius: 10px');
    expect(contentCss).toContain('box-shadow: none');
    expect(contentCss).toContain('gap: 6px');
  });

  it('supports uploaded and remote homepage icons without hiding entries after the fourth', () => {
    const adminHome = read('app/pages/admin/home.vue');
    const publicHome = read('app/pages/index.vue');
    const publicCss = read('app/assets/css/public.css');

    expect(adminHome).toContain('category="icons"');
    expect(adminHome).toContain('handleEntryIconUploaded');
    expect(publicHome).toContain('entryIconUrl(item)');
    expect(publicHome).toContain("key: 'public-home-page'");
    expect(publicHome).toContain("'--entry-index': index");
    expect(publicCss).toContain('animation-delay: calc(var(--entry-index) * 0.06s + 0.36s)');
    expect(publicCss).not.toContain('.home-prototype__entry:nth-child(4)');
  });

  it('renders compact homepage entries with the configured icon before the title', () => {
    const publicHome = read('app/pages/index.vue');
    const publicCss = read('app/assets/css/public.css');
    const internalEntry = publicHome.slice(
      publicHome.indexOf('v-if="item.targetType === \'INTERNAL\'"'),
      publicHome.indexOf('<a\n              v-else'),
    );
    const externalEntry = publicHome.slice(publicHome.indexOf('<a\n              v-else'));

    expect(internalEntry.indexOf('entryIconUrl(item)')).toBeLessThan(
      internalEntry.indexOf('{{ item.title }}'),
    );
    expect(externalEntry.indexOf('entryIconUrl(item)')).toBeLessThan(
      externalEntry.indexOf('{{ item.title }}'),
    );
    expect(publicCss).toContain('flex: 0 0 215px');
    expect(publicCss).toContain('width: 215px');
    expect(publicCss).toContain('height: 120px');
    expect(publicCss).toContain('justify-content: flex-start');
    expect(publicCss).toContain('padding: 72px 36px 48px');
  });

  it('supports bundled static SVG icons for homepage entries', () => {
    const publicHome = read('app/pages/index.vue');
    const defaults = read('server/services/home-defaults.ts');

    expect(publicHome).toContain("item.icon.startsWith('/') && !item.icon.startsWith('//')");
    expect(defaults).toContain("icon: '/icons/home-blog.svg'");
    expect(defaults).toContain("icon: '/icons/home-projects.svg'");
    expect(defaults).toContain("icon: '/icons/home-cv.svg'");
    expect(defaults).toContain("icon: '/icons/home-about.svg'");
  });

  it('keeps the homepage footer free of a misleading static theme label', () => {
    const publicHome = read('app/pages/index.vue');

    expect(publicHome).not.toContain('System</b> theme');
    expect(publicHome).not.toContain('home-prototype__kbd');
  });
});
