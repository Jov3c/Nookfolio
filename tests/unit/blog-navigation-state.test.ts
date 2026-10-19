import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('blog list navigation state', () => {
  it('keeps the loaded list alive and restores its scroll position after reading an article', () => {
    const blogIndex = read('app/pages/blog/index.vue');

    expect(blogIndex).toContain('keepalive: true');
    expect(blogIndex).toContain('onBeforeRouteLeave');
    expect(blogIndex).toContain('onActivated');
    expect(blogIndex).toContain("window.scrollTo({ top: savedScrollY.value, behavior: 'auto' })");
    expect(blogIndex).toMatch(/onMounted\(\(\) => \{[^}]*observeLoadMore\(\)/);
  });

  it('does not animate router scroll restoration through the old blog page', () => {
    const baseCss = read('app/assets/css/base.css');

    expect(baseCss).not.toMatch(/html\s*{[^}]*scroll-behavior:\s*smooth/s);
  });

  it('uses one navigation handler for article cards so the transition cannot race the router link', () => {
    const postCard = read('app/components/blog/PostCard.vue');
    const prototypeCss = read('app/assets/css/prototype.css');
    const baseCss = read('app/assets/css/base.css');

    expect(postCard).toContain('<a');
    expect(postCard).not.toContain('<NuxtLink');
    expect(postCard).toContain('@click="openPost"');
    expect(postCard).toContain("'post-card--leaving': leaving");
    expect(prototypeCss).toMatch(
      /\.post-card\.is-revealed\.post-card--leaving\s*{[^}]*animation:/s,
    );
    expect(baseCss).toMatch(/@keyframes blog-page-in\s*{[^}]*opacity:\s*0/s);
    expect(baseCss).not.toMatch(/@keyframes blog-page-in\s*{[^}]*translateY/s);
  });
});
