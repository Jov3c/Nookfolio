import { describe, expect, it } from 'vitest';

import { shouldShowBackToTop } from '../../app/utils/scroll-position';

describe('back to top visibility', () => {
  it('only appears after scrolling on a page that can scroll', () => {
    expect(shouldShowBackToTop(600, 2400, 900)).toBe(true);
    expect(shouldShowBackToTop(120, 2400, 900)).toBe(false);
    expect(shouldShowBackToTop(600, 900, 900)).toBe(false);
  });
});
