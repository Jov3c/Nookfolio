import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import {
  DEFAULT_HOME_ENTRIES,
  DEFAULT_SOCIAL_LINKS,
  ensureHomeDefaults,
} from '../../server/services/home-defaults';

describe('home defaults', () => {
  it('does not publish a preset social identity', () => {
    expect(DEFAULT_SOCIAL_LINKS).toEqual([]);
  });

  it('ships four visible homepage destinations and a hidden timeline entry', () => {
    expect(
      DEFAULT_HOME_ENTRIES.map(({ title, url, sortOrder, visible }) => ({
        title,
        url,
        sortOrder,
        visible,
      })),
    ).toEqual([
      { title: 'Blog', url: '/blog', sortOrder: 10, visible: true },
      { title: 'Projects', url: '/projects', sortOrder: 20, visible: true },
      { title: 'CV', url: '/about/cv', sortOrder: 30, visible: true },
      { title: 'About', url: '/about', sortOrder: 40, visible: true },
      { title: 'Timeline', url: '/about/timeline', sortOrder: 50, visible: false },
    ]);
  });

  it('migrates only untouched legacy defaults and does not seed timeline into an empty database', () => {
    const migration = readFileSync(
      resolve(
        import.meta.dirname,
        '../../prisma/migrations/20261016143000_restructure_about_and_home_entries/migration.sql',
      ),
      'utf8',
    );

    expect(migration).toContain('"description" = \'浏览全部文章归档。\'');
    expect(migration).toContain('"sort_order" = 30');
    expect(migration).toContain('"visible" = TRUE');
    expect(migration).toContain('WITH "migrated_about" AS');
    expect(migration).toContain('FROM "migrated_about"');
  });

  it('initializes defaults behind a transaction advisory lock', async () => {
    const executeRaw = vi.fn().mockResolvedValue(1);
    const tx = {
      $executeRaw: executeRaw,
      siteProfile: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({}),
      },
      homeProfile: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({}),
      },
      homeEntry: {
        count: vi.fn().mockResolvedValue(0),
        createMany: vi.fn().mockResolvedValue({ count: DEFAULT_HOME_ENTRIES.length }),
      },
      socialLink: {
        count: vi.fn().mockResolvedValue(0),
        createMany: vi.fn().mockResolvedValue({ count: DEFAULT_SOCIAL_LINKS.length }),
      },
    };
    const transaction = vi.fn(async (callback: (client: typeof tx) => Promise<void>) =>
      callback(tx),
    );

    await ensureHomeDefaults({ $transaction: transaction } as never);

    expect(transaction).toHaveBeenCalledOnce();
    expect(executeRaw).toHaveBeenCalledOnce();
    expect(tx.homeEntry.createMany).toHaveBeenCalledOnce();
    expect(tx.socialLink.createMany).not.toHaveBeenCalled();
  });
});
