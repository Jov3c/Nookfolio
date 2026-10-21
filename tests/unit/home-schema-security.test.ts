import { describe, expect, it } from 'vitest';

import { homeEntrySchema, socialLinkSchema } from '../../shared/schemas/home';

const entry = {
  title: '入口',
  description: '安全链接',
  icon: null,
  iconMediaId: null,
  openNewTab: false,
  sortOrder: 10,
  visible: true,
};

describe('home link schema security', () => {
  it('only accepts site-relative paths for internal entries', () => {
    expect(
      homeEntrySchema.safeParse({ ...entry, url: '/blog', targetType: 'INTERNAL' }).success,
    ).toBe(true);
    expect(
      homeEntrySchema.safeParse({ ...entry, url: '//evil.example', targetType: 'INTERNAL' })
        .success,
    ).toBe(false);
    expect(
      homeEntrySchema.safeParse({ ...entry, url: 'javascript:alert(1)', targetType: 'INTERNAL' })
        .success,
    ).toBe(false);
    expect(
      homeEntrySchema.safeParse({ ...entry, url: 'https://example.com', targetType: 'INTERNAL' })
        .success,
    ).toBe(false);
  });

  it('only accepts HTTP URLs for external entries', () => {
    expect(
      homeEntrySchema.safeParse({
        ...entry,
        url: 'https://example.com/path',
        targetType: 'EXTERNAL',
      }).success,
    ).toBe(true);
    expect(
      homeEntrySchema.safeParse({ ...entry, url: 'javascript:alert(1)', targetType: 'EXTERNAL' })
        .success,
    ).toBe(false);
    expect(
      homeEntrySchema.safeParse({ ...entry, url: 'data:text/html,test', targetType: 'EXTERNAL' })
        .success,
    ).toBe(false);
    expect(
      homeEntrySchema.safeParse({ ...entry, url: '/blog', targetType: 'EXTERNAL' }).success,
    ).toBe(false);
  });

  it('allows safe social destinations and rejects executable protocols', () => {
    const social = { name: '联系', icon: null, sortOrder: 10, visible: true };

    expect(socialLinkSchema.safeParse({ ...social, url: '/rss.xml' }).success).toBe(true);
    expect(socialLinkSchema.safeParse({ ...social, url: 'https://example.com' }).success).toBe(
      true,
    );
    expect(socialLinkSchema.safeParse({ ...social, url: 'mailto:hello@example.com' }).success).toBe(
      true,
    );
    expect(socialLinkSchema.safeParse({ ...social, url: '//evil.example' }).success).toBe(false);
    expect(socialLinkSchema.safeParse({ ...social, url: 'javascript:alert(1)' }).success).toBe(
      false,
    );
    expect(socialLinkSchema.safeParse({ ...social, url: 'data:text/html,test' }).success).toBe(
      false,
    );
  });
});
