import { describe, expect, it } from 'vitest';

import { buildPageSeoMeta } from '../../app/utils/seo';

describe('page SEO metadata', () => {
  it('builds canonical and social metadata from one page description', () => {
    expect(
      buildPageSeoMeta(
        {
          title: 'A post — Nookfolio',
          description: 'A useful post',
          path: '/blog/a-post',
          type: 'article',
          image: 'https://cdn.example.com/cover.jpg',
        },
        'https://site.example',
      ),
    ).toEqual({
      title: 'A post — Nookfolio',
      description: 'A useful post',
      canonical: 'https://site.example/blog/a-post',
      ogTitle: 'A post — Nookfolio',
      ogDescription: 'A useful post',
      ogType: 'article',
      ogUrl: 'https://site.example/blog/a-post',
      ogImage: 'https://cdn.example.com/cover.jpg',
      twitterCard: 'summary_large_image',
    });
  });

  it('uses the current public path and website card when no optional values are supplied', () => {
    expect(
      buildPageSeoMeta(
        { title: 'Nookfolio', description: 'A personal site' },
        'https://site.example/',
        '/projects?tab=all',
      ),
    ).toMatchObject({
      canonical: 'https://site.example/projects',
      ogType: 'website',
      twitterCard: 'summary',
    });

    expect(
      buildPageSeoMeta(
        { title: 'A post', description: 'A post', image: '/uploads/cover.jpg' },
        'https://site.example',
        '/blog/a-post',
      ),
    ).toMatchObject({ ogImage: 'https://site.example/uploads/cover.jpg' });
  });
});
