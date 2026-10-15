import type { PrismaClient } from '../generated/prisma/client';

const DEFAULT_PROFILE = {
  isPublic: true,
  name: '你的名字',
  headline: '请填写职业方向',
  bio: '请在后台填写个人简介，并在确认内容后开启公开展示。',
  location: '请填写所在地',
  website: null,
  statusText: null,
  statement: '请填写个人陈述。',
};

const DEFAULT_EXPERIENCES = [
  {
    company: '示例公司',
    role: '示例职位',
    location: '示例城市',
    startDate: new Date('2025-01-01T00:00:00.000Z'),
    endDate: null,
    isCurrent: true,
    description: '这是一段教程工作经历，请在后台替换或删除。',
    sortOrder: 10,
  },
];

const DEFAULT_EDUCATIONS = [
  {
    school: '示例学校',
    major: '示例专业',
    degree: '示例学历',
    startDate: new Date('2021-01-01T00:00:00.000Z'),
    endDate: new Date('2024-01-01T00:00:00.000Z'),
    description: '这是一段教程教育经历，请在后台替换或删除。',
    sortOrder: 10,
  },
];

const DEFAULT_SKILLS = [
  {
    title: '示例技能组',
    content: '请在后台替换为你的技能',
    sortOrder: 10,
  },
];

export async function seedCvDefaults(prisma: PrismaClient) {
  if (await prisma.cvProfile.count()) return false;

  await prisma.cvProfile.create({
    data: {
      ...DEFAULT_PROFILE,
      experiences: { create: DEFAULT_EXPERIENCES },
      educations: { create: DEFAULT_EDUCATIONS },
      skillGroups: { create: DEFAULT_SKILLS },
    },
  });

  return true;
}
