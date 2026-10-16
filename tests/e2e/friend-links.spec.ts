import { expect, test } from '@playwright/test';
import { createAdminSession } from '../fixtures/admin-session';

test('admin can open an empty friend-link queue', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Admin friend link flow runs once');

  await createAdminSession(page);

  await page.goto('/admin/links');
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: '友链管理', exact: true })).toBeVisible();
  await expect(page.getByRole('tab', { name: /已发布/ })).toBeVisible();
  await expect(page.getByText('当前状态下没有友链。')).toBeVisible();
});

test('friend link applications use an independent three-per-hour IP limit', async ({
  request,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Rate limit contract runs once');

  const ip = `10.8.0.${Math.floor(Math.random() * 200) + 20}`;
  const payload = {
    websiteName: 'Rate limit test',
    websiteUrl: 'https://rate-limit.example',
    description: 'A request used to verify the application limiter.',
    contactEmail: 'rate-limit@example.com',
  };
  const statuses: number[] = [];
  for (let index = 0; index < 4; index += 1) {
    const response = await request.post('/api/v1/public/links/apply', {
      headers: { 'x-forwarded-for': ip },
      data: payload,
    });
    statuses.push(response.status());
  }

  expect(statuses.slice(0, 3)).toEqual([503, 503, 503]);
  expect(statuses[3]).toBe(429);
});
