import type { PrismaClient } from '../generated/prisma/client';

export const DEFAULT_SITE_PROFILE = {
  siteTitle: '我的个人网站',
  siteDescription: '请登录后台填写站点介绍。',
  foundedAt: new Date('2026-01-01T00:00:00.000Z'),
  brandText: 'SITE',
};

export const DEFAULT_HOME_PROFILE = {
  nickname: '你的名字',
  role: '请填写个人身份',
  intro: '这是首页介绍。请登录后台替换为你自己的内容。',
  statusText: null,
  statusVisible: false,
};

export const DEFAULT_HOME_ENTRIES = [
  {
    title: 'Blog',
    description: '记录想法和生活。',
    icon: '/icons/home-blog.svg',
    url: '/blog',
    targetType: 'INTERNAL' as const,
    openNewTab: false,
    sortOrder: 10,
    visible: true,
  },
  {
    title: 'Projects',
    description: '项目卡片集。',
    icon: '/icons/home-projects.svg',
    url: '/projects',
    targetType: 'INTERNAL' as const,
    openNewTab: false,
    sortOrder: 20,
    visible: true,
  },
  {
    title: 'CV',
    description: '经历、技能与作品。',
    icon: '/icons/home-cv.svg',
    url: '/about/cv',
    targetType: 'INTERNAL' as const,
    openNewTab: false,
    sortOrder: 30,
    visible: true,
  },
  {
    title: 'About',
    description: '关于我与这个网站。',
    icon: '/icons/home-about.svg',
    url: '/about',
    targetType: 'INTERNAL' as const,
    openNewTab: false,
    sortOrder: 40,
    visible: true,
  },
  {
    title: 'Timeline',
    description: '浏览人生时间线。',
    icon: null,
    url: '/about/timeline',
    targetType: 'INTERNAL' as const,
    openNewTab: false,
    sortOrder: 50,
    visible: false,
  },
];

export const DEFAULT_SOCIAL_LINKS: Array<{
  name: string;
  icon: string;
  url: string;
  sortOrder: number;
  visible: boolean;
}> = [];

export async function ensureHomeDefaults(prisma: PrismaClient) {
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(725531)`;

    const [siteProfile, homeProfile, homeEntryCount, socialLinkCount] = await Promise.all([
      tx.siteProfile.findFirst(),
      tx.homeProfile.findFirst(),
      tx.homeEntry.count(),
      tx.socialLink.count(),
    ]);

    if (!siteProfile) await tx.siteProfile.create({ data: DEFAULT_SITE_PROFILE });
    if (!homeProfile) await tx.homeProfile.create({ data: DEFAULT_HOME_PROFILE });
    if (homeEntryCount === 0) await tx.homeEntry.createMany({ data: DEFAULT_HOME_ENTRIES });
    if (socialLinkCount === 0 && DEFAULT_SOCIAL_LINKS.length > 0) {
      await tx.socialLink.createMany({ data: DEFAULT_SOCIAL_LINKS });
    }
  });
}
