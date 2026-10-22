import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('reading controls', () => {
  it('keeps long article and README tables of contents independently scrollable', () => {
    const css = read('app/assets/css/prototype.css');

    expect(css).toMatch(/\.article-toc__desktop\s*\{[\s\S]*?max-height:\s*calc\(100dvh/);
    expect(css).toMatch(/\.article-toc__desktop\s*\{[\s\S]*?overflow-y:\s*auto/);
  });

  it('keeps the admin back-to-top control in a viewport corner', () => {
    const css = read('app/assets/css/base.css');

    expect(css).toMatch(/\.back-to-top--admin\s*\{[\s\S]*?right:\s*24px/);
    expect(css).toMatch(/\.back-to-top--admin\s*\{[\s\S]*?left:\s*auto/);
  });

  it('uses complete centered cover images in cards and article pages', () => {
    const css = read('app/assets/css/prototype.css');

    expect(css).toMatch(/\.post-card__cover-art--image\s*\{[\s\S]*?background-size:\s*contain/);
    expect(css).toMatch(/\.article-cover\s*\{[\s\S]*?object-fit:\s*contain/);
  });
});
