import type { PrismaClient } from '../generated/prisma/client';
import { seedAboutDefaults } from './about-defaults';
import { seedBlogDefaults } from './blog-defaults';
import { seedCommunityDefaults } from './community-defaults';
import { seedCvDefaults } from './cv-defaults';
import { seedFriendLinkDefaults } from './friend-link-defaults';
import { ensureHomeDefaults } from './home-defaults';
import { seedProjectDefaults } from './project-defaults';
import { seedTimelineDefaults } from './timeline-defaults';

type SeedDependencies = {
  ensureHomeDefaults: typeof ensureHomeDefaults;
  seedProjectDefaults: typeof seedProjectDefaults;
  seedBlogDefaults: typeof seedBlogDefaults;
  seedCommunityDefaults: typeof seedCommunityDefaults;
  seedCvDefaults: typeof seedCvDefaults;
  seedFriendLinkDefaults: typeof seedFriendLinkDefaults;
  seedTimelineDefaults: typeof seedTimelineDefaults;
  seedAboutDefaults: typeof seedAboutDefaults;
};

const defaultDependencies: SeedDependencies = {
  ensureHomeDefaults,
  seedProjectDefaults,
  seedBlogDefaults,
  seedCommunityDefaults,
  seedCvDefaults,
  seedFriendLinkDefaults,
  seedTimelineDefaults,
  seedAboutDefaults,
};

export async function seedSiteContent(
  prisma: PrismaClient,
  dependencies: SeedDependencies = defaultDependencies,
) {
  await dependencies.ensureHomeDefaults(prisma);
  await dependencies.seedProjectDefaults(prisma);
  await dependencies.seedBlogDefaults(prisma);
  await dependencies.seedCommunityDefaults(prisma);
  await dependencies.seedFriendLinkDefaults(prisma);
  await dependencies.seedCvDefaults(prisma);
  await dependencies.seedTimelineDefaults(prisma);
  await dependencies.seedAboutDefaults(prisma);
}
