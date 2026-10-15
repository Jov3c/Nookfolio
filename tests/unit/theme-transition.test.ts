import { describe, expect, it } from 'vitest';

import {
  getNextTheme,
  getThemeTransitionGeometry,
  normalizeStoredTheme,
} from '../../app/utils/theme-transition';

describe('theme transition', () => {
  it('alternates between light and dark on every invocation', () => {
    expect(getNextTheme('light')).toBe('dark');
    expect(getNextTheme('dark')).toBe('light');
  });

  it('ignores invalid persisted values instead of applying an unsupported theme', () => {
    expect(normalizeStoredTheme('dark')).toBe('dark');
    expect(normalizeStoredTheme('light')).toBe('light');
    expect(normalizeStoredTheme('system')).toBeNull();
    expect(normalizeStoredTheme(null)).toBeNull();
  });

  it('covers the viewport from the actual click position', () => {
    expect(getThemeTransitionGeometry(100, 50, 1200, 800)).toEqual({
      x: 100,
      y: 50,
      radius: Math.hypot(1100, 750),
    });
  });
});
