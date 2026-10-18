import { describe, expect, it } from 'vitest';

import {
  appendUniquePosts,
  createHeadingId,
  getReadingProgress,
  hasArticleTableOfContents,
} from '../../app/utils/blog-reading';

describe('blog reading experience', () => {
  it('appends the next page without duplicating existing posts', () => {
    expect(
      appendUniquePosts(
        [
          { id: '1', slug: 'first' },
          { id: '2', slug: 'second' },
        ],
        [
          { id: '2', slug: 'second' },
          { id: '3', slug: 'third' },
        ],
      ).map((post) => post.slug),
    ).toEqual(['first', 'second', 'third']);
  });

  it('creates stable unique ids for repeated article headings', () => {
    const used = new Set<string>();
    expect(createHeadingId('连接本地模型服务', used)).toBe('连接本地模型服务');
    expect(createHeadingId('连接本地模型服务', used)).toBe('连接本地模型服务-2');
  });

  it('clamps live reading progress to the article range', () => {
    expect(getReadingProgress(200, 200, 1800, 800)).toBe(0);
    expect(getReadingProgress(700, 200, 1800, 800)).toBe(0.5);
    expect(getReadingProgress(1600, 200, 1800, 800)).toBe(1);
  });

  it('uses the two-column reading layout only when headings exist', () => {
    expect(hasArticleTableOfContents([])).toBe(false);
    expect(hasArticleTableOfContents([{ id: 'section' }])).toBe(true);
  });
});
