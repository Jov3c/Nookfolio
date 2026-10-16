import { describe, expect, it } from 'vitest';

import { AboutService } from '../../server/services/about-service';

const aggregate = {
  id: '00000000-0000-4000-8000-000000000100',
  eyebrow: 'A PERSONAL NOTE',
  title: '独立 About',
  introduction: '独立引言',
  personalTitle: '关于我',
  personalBody: '独立个人介绍',
  quote: '独立引用',
  siteTitle: '关于网站',
  siteBody: '独立网站介绍',
  siteFacts: [{ label: 'Since', value: '2026' }],
  updatedAt: new Date('2026-10-17T00:00:00.000Z'),
};

describe('About service', () => {
  it('returns only independent About fields', async () => {
    const repository = { find: async () => aggregate };
    const result = await new AboutService(repository as never).getPublic();

    expect(result).toMatchObject({ title: '独立 About', updatedAt: '2026-10-17T00:00:00.000Z' });
    expect(result).not.toHaveProperty('id');
    expect(result).not.toHaveProperty('homeProfile');
    expect(result).not.toHaveProperty('cvProfile');
  });

  it('validates and persists a partial update', async () => {
    let saved: Record<string, unknown> | undefined;
    const repository = {
      find: async () => aggregate,
      update: async (_id: string, input: Record<string, unknown>) => {
        saved = input;
        return { ...aggregate, ...input };
      },
    };
    const result = await new AboutService(repository as never).update({ quote: ' 新引用 ' });

    expect(saved).toEqual({ quote: '新引用' });
    expect(result.quote).toBe('新引用');
  });

  it('rejects invalid updates before persistence', async () => {
    let called = false;
    const repository = {
      find: async () => aggregate,
      update: async () => {
        called = true;
        return aggregate;
      },
    };

    await expect(new AboutService(repository as never).update({ title: '' })).rejects.toMatchObject({
      statusCode: 400,
      code: 'INVALID_ABOUT',
    });
    expect(called).toBe(false);
  });
});
