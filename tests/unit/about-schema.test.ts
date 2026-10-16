import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { aboutProfileSchema, aboutProfileUpdateSchema } from '../../shared/schemas/about';

const validProfile = {
  eyebrow: ' A PERSONAL NOTE ',
  title: ' 在网络上，留一间自己的房间。 ',
  introduction: ' 一段独立的 About 引言。 ',
  personalTitle: ' 关于我 ',
  personalBody: ' 这里是只属于 About 页面的个人介绍。 ',
  quote: ' 保持好奇。 ',
  siteTitle: ' 关于网站 ',
  siteBody: ' 这里介绍网站本身。 ',
  siteFacts: [
    { label: 'Since', value: '2026' },
    { label: 'Focus', value: 'Writing & Building' },
  ],
};

describe('About profile schemas', () => {
  it('enforces and atomically seeds a single About profile', () => {
    const root = resolve(import.meta.dirname, '../..');
    const prisma = readFileSync(resolve(root, 'prisma/schema.prisma'), 'utf8');
    const migration = readFileSync(
      resolve(root, 'prisma/migrations/20261017010000_independent_about_profile/migration.sql'),
      'utf8',
    );
    const defaults = readFileSync(resolve(root, 'server/services/about-defaults.ts'), 'utf8');

    expect(prisma).toContain('singletonKey  Int      @unique @default(1)');
    expect(migration).toContain('CHECK ("singleton_key" = 1)');
    expect(defaults).toContain('aboutProfile.upsert');
    expect(defaults).not.toContain('aboutProfile.count()');
  });

  it('normalizes a complete independent About profile', () => {
    const parsed = aboutProfileSchema.parse(validProfile);

    expect(parsed.title).toBe('在网络上，留一间自己的房间。');
    expect(parsed.siteFacts[0]).toEqual({ label: 'Since', value: '2026' });
  });

  it('accepts partial admin updates', () => {
    expect(aboutProfileUpdateSchema.parse({ quote: ' 新引用 ' })).toEqual({ quote: '新引用' });
  });

  it('rejects empty content and more than eight website facts', () => {
    expect(() => aboutProfileSchema.parse({ ...validProfile, personalBody: ' ' })).toThrow();
    expect(() =>
      aboutProfileSchema.parse({
        ...validProfile,
        siteFacts: Array.from({ length: 9 }, (_, index) => ({
          label: `Label ${index}`,
          value: `Value ${index}`,
        })),
      }),
    ).toThrow();
  });
});
