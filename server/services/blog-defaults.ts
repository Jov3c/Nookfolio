import type { PrismaClient } from '../generated/prisma/client';

import { countMarkdownWords } from '../../shared/word-count';

const DEFAULT_CATEGORIES = [
  { slug: 'guide', name: '使用指南', sortOrder: 10, visible: true },
  { slug: 'notes', name: '站点记录', sortOrder: 20, visible: true },
] as const;

const DEFAULT_POSTS = [
  {
    slug: 'getting-started',
    category: 'guide',
    title: '开始使用你的个人网站',
    excerpt: '这是一篇教程文章，用来介绍后台内容管理和发布流程。',
    publishedAt: '2026-01-01T09:00:00+08:00',
    markdownBody: `# 开始使用你的个人网站

登录后台后，你可以修改首页资料、创建项目、发布文章并维护个人简历。

## 建议步骤

1. 在“首页资料”中填写站点名称与个人介绍。
2. 在“文章管理”中编辑或删除这篇教程。
3. 上传头像和站点图标。

完成设置后，请在“文章管理”中删除这篇教程文章。`,
  },
  {
    slug: 'write-first-post',
    category: 'guide',
    title: '如何发布第一篇文章',
    excerpt: '了解文章标题、摘要、分类、正文和发布状态的用途。',
    publishedAt: '2026-01-02T09:00:00+08:00',
    markdownBody: `# 如何发布第一篇文章

在后台打开“发布文章”，填写标题、摘要、分类和 Markdown 正文。

编辑中的内容会自动进入草稿箱；确认内容无误后，点击“发布文章”。`,
  },
  {
    slug: 'customize-site',
    category: 'notes',
    title: '站点上线前的设置清单',
    excerpt: '用一份简短清单检查首页、导航、媒体和公开资料。',
    publishedAt: '2026-01-03T09:00:00+08:00',
    markdownBody: `# 站点上线前的设置清单

- 替换站点名称、图标和头像
- 检查首页入口与社交链接
- 删除所有教程内容
- 确认公开简历不包含敏感信息
- 检查移动端和桌面端页面`,
  },
] as const;

export async function seedBlogDefaults(prisma: PrismaClient) {
  const categories = new Map<string, string>();
  for (const category of DEFAULT_CATEGORIES) {
    const record = await prisma.postCategory.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    categories.set(record.slug, record.id);
  }

  for (const post of DEFAULT_POSTS) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        categoryId: categories.get(post.category)!,
        coverMediaId: null,
        markdownBody: post.markdownBody,
        status: 'PUBLISHED' as const,
        publishedAt: new Date(post.publishedAt),
        wordCount: countMarkdownWords(post.markdownBody),
        viewCount: BigInt(0),
        seoTitle: null,
        seoDescription: null,
      },
    });
  }
  return true;
}
