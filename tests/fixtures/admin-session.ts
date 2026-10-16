import type { Page } from '@playwright/test';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../../server/generated/prisma/client';
import { createSessionToken, hashSessionToken } from '../../server/utils/security';

export async function createAdminSession(page: Page) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is required');

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
  const email = (process.env.ADMIN_EMAIL ?? 'stage02-admin@example.com').toLowerCase();
  const applicationOrigin = new URL(process.env.PLAYWRIGHT_BASE_URL ?? 'https://127.0.0.1:3000')
    .origin;
  try {
    const admin = await prisma.adminUser.findUnique({ where: { email }, select: { id: true } });
    if (!admin) throw new Error(`Browser fixture admin does not exist: ${email}`);
    const token = createSessionToken();
    await prisma.adminSession.create({
      data: {
        adminId: admin.id,
        tokenHash: hashSessionToken(token),
        expiresAt: new Date(Date.now() + 60 * 60 * 1_000),
      },
    });
    await page.context().addCookies([
      {
        name: 'nookfolio_admin_session',
        value: token,
        url: process.env.PLAYWRIGHT_BASE_URL ?? 'https://127.0.0.1:3000',
        httpOnly: true,
        secure: true,
        sameSite: 'Lax',
      },
    ]);
    await page.context().setExtraHTTPHeaders({ Origin: applicationOrigin });
  } finally {
    await prisma.$disconnect();
  }
}
