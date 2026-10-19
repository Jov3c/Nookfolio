import { describe, expect, it } from 'vitest';

import { blogNavigation, primaryNavigation } from '../../app/data/navigation';

describe('public navigation contract', () => {
  it('keeps the locked primary navigation order', () => {
    expect(primaryNavigation.map((item) => item.label)).toEqual([
      'Home',
      'Projects',
      'Blog',
      'Links',
      'About',
    ]);
    expect(primaryNavigation.at(-1)).toEqual({ label: 'About', to: '/about' });
    expect(primaryNavigation.every((item) => !('englishLabel' in item))).toBe(true);
  });

  it('exposes the active blog utility routes without placeholder anchors', () => {
    expect(blogNavigation.map((item) => item.label)).toEqual(['博客首页', '归档', '留言']);
    expect(blogNavigation[0]).toEqual({ label: '博客首页', to: '/blog' });
    expect(primaryNavigation[3]).toEqual({ label: 'Links', to: '/blog/links' });

    const destinations = [primaryNavigation, blogNavigation].flat().map((item) => item.to);

    expect(destinations).not.toContain('#');
    expect(destinations.every((destination) => destination.startsWith('/'))).toBe(true);
  });
});
