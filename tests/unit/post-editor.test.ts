import { describe, expect, it } from 'vitest';

import {
  createAutomaticPostSlug,
  createDraftPayload,
  validatePostForPublish,
} from '../../app/utils/post-editor';

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  categoryId: '0199f15e-67bd-7000-8000-000000000001',
  coverMediaId: '',
  markdownBody: '',
  seoTitle: '',
  seoDescription: '',
};

describe('article publishing editor', () => {
  it('creates a persistable draft from an unfinished article', () => {
    expect(createDraftPayload(emptyForm, 'draft-123')).toMatchObject({
      title: '未命名文章',
      slug: 'draft-123',
      excerpt: '尚未填写摘要',
      status: 'DRAFT',
      markdownBody: '',
    });
  });

  it('returns clear field errors before publishing incomplete content', () => {
    expect(validatePostForPublish(emptyForm)).toEqual([
      '请填写文章标题',
      '请填写路径标识',
      '请填写文章摘要',
      '请填写文章正文',
    ]);
  });

  it('creates a readable automatic path from an English title', () => {
    expect(createAutomaticPostSlug('My First Post!', 'post-20261018-a7k3')).toBe('my-first-post');
  });

  it('uses the stable fallback path when a title has no latin words', () => {
    expect(createAutomaticPostSlug('我的第一篇文章', 'post-20261018-a7k3')).toBe(
      'post-20261018-a7k3',
    );
  });

  it('allows the publishing page to validate content with an automatic path', () => {
    expect(
      validatePostForPublish(
        {
          ...emptyForm,
          title: '自动路径文章',
          excerpt: '文章摘要',
          markdownBody: '# 正文',
        },
        { automaticSlug: true },
      ),
    ).toEqual([]);
  });
});
