import type { PrismaClient } from '../generated/prisma/client';

const DEFAULT_ENTRIES = [
  {
    eventDate: '2026-01-01',
    datePrecision: 'DAY' as const,
    title: '开始配置网站',
    bodyMarkdown: '这是一条教程时间线。请在后台替换为你自己的经历。',
    sortOrder: 10,
  },
  {
    eventDate: '2026-01-02',
    datePrecision: 'DAY' as const,
    title: '发布第一篇文章',
    bodyMarkdown: '熟悉后台后，可以删除全部教程内容并开始正式发布。',
    sortOrder: 20,
  },
];

export async function seedTimelineDefaults(prisma: PrismaClient) {
  if (await prisma.timelineEntry.count()) return false;

  await prisma.timelineEntry.createMany({
    data: DEFAULT_ENTRIES.map((entry) => ({
      ...entry,
      eventDate: new Date(`${entry.eventDate}T00:00:00.000Z`),
      visible: true,
    })),
  });
  return true;
}
