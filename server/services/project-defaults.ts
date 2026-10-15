import type { PrismaClient } from '../generated/prisma/client';

export const DEFAULT_PROJECTS = [
  {
    slug: 'example-project',
    name: '示例项目',
    summary: '这是一个教程项目，用来展示项目卡片和详情页。完成配置后可以删除。',
    status: 'BUILDING' as const,
    techStack: ['示例技术', 'Markdown'],
    githubUrl: null,
    demoUrl: null,
    readmeMarkdown: `# 示例项目

在后台的“项目管理”中修改这里的名称、简介、状态和技术栈。

## 项目详情

项目详情支持 Markdown。你可以添加功能说明、使用方法、图片和相关链接。

完成自己的项目资料后，请删除这个教程项目。`,
    sortOrder: 10,
    visible: true,
  },
] satisfies Parameters<PrismaClient['project']['createMany']>[0]['data'];

export async function seedProjectDefaults(prisma: PrismaClient) {
  if ((await prisma.project.count()) > 0) return false;
  await prisma.project.createMany({ data: DEFAULT_PROJECTS });
  return true;
}
