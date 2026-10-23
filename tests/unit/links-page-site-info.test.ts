import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('public links page site information', () => {
  it('publishes copyable site details using the current home avatar', () => {
    const page = read('app/pages/blog/links.vue');

    expect(page).toContain('/api/v1/public/home');
    expect(page).toContain('站点信息');
    expect(page).toContain('保持好奇。');
    expect(page).toContain('icon: `${siteOrigin.value}/avatar`');
    expect(page).toContain('/rss.xml');
    expect(page).toContain('site-link-card__code');
    expect(page).toMatch(
      /<button[^>]*class="site-link-card__row"[^>]*[\s\S]*?site-link-card__label[\s\S]*?<code>/,
    );
    expect(page).not.toContain("copiedField === field ? '已复制' : '复制'");
    expect(read('server/routes/avatar.get.ts')).toContain('homeProfile.avatar');
  });

  it('uses a compact two-column site-information card', () => {
    const css = read('app/assets/css/prototype.css');

    expect(css).toMatch(/\.site-link-card__code\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2/);
    expect(css).toMatch(/\.site-link-card__row\s*\{[\s\S]*?cursor:\s*pointer/);
  });

  it('includes the official BlogsClub random-blog route', () => {
    const menu = read('app/components/shell/TravellingLink.vue');

    expect(menu).toContain('https://blogs.quest');
    expect(menu).toContain('/images/blog-routes/blogsclub.jpg');
  });
});
