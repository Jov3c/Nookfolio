import type { PrismaClient } from '../generated/prisma/client';

export const DEFAULT_ABOUT_PROFILE = {
  eyebrow: 'A PERSONAL NOTE',
  title: '在网络上，留一间自己的房间。',
  introduction: '这里是一段独立的 About 页面引言，请在后台替换为你的内容。',
  personalTitle: '关于我',
  personalBody: '这里介绍你自己、关注的方向，以及希望长期记录的事情。',
  quote: '保持好奇，认真完成，并把值得留下的东西保存下来。',
  siteTitle: '关于网站',
  siteBody: '这里介绍网站的目的、内容和持续维护方式。',
  siteFacts: [
    { label: 'Since', value: '2026' },
    { label: 'Focus', value: 'Writing & Building' },
  ],
};

export async function seedAboutDefaults(prisma: PrismaClient) {
  const existing = await prisma.aboutProfile.findUnique({ where: { singletonKey: 1 } });
  await prisma.aboutProfile.upsert({
    where: { singletonKey: 1 },
    update: {},
    create: { singletonKey: 1, ...DEFAULT_ABOUT_PROFILE },
  });
  return !existing;
}
