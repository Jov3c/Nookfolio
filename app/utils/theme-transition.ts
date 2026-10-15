export type SiteTheme = 'light' | 'dark';

export function getNextTheme(theme: SiteTheme): SiteTheme {
  return theme === 'dark' ? 'light' : 'dark';
}

export function normalizeStoredTheme(value: string | null): SiteTheme | null {
  return value === 'light' || value === 'dark' ? value : null;
}

export function getThemeTransitionGeometry(
  x: number,
  y: number,
  viewportWidth: number,
  viewportHeight: number,
) {
  return {
    x,
    y,
    radius: Math.hypot(Math.max(x, viewportWidth - x), Math.max(y, viewportHeight - y)),
  };
}
