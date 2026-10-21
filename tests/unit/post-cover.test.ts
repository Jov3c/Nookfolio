import { describe, expect, it } from 'vitest';

import { createDefaultPostCoverLabel } from '../../app/utils/post-cover';

describe('default post cover label', () => {
  it.each([
    ['日常絮叨', '日常'],
    ['开发', '开发'],
    ['AI', 'AI'],
    ['诗', '诗录'],
    ['', '文章'],
  ])('turns %j into a stable two-character label', (category, expected) => {
    expect(createDefaultPostCoverLabel(category)).toBe(expected);
  });
});
