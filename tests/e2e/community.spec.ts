import { expect, test } from '@playwright/test';
import { createAdminSession } from '../fixtures/admin-session';

test('public article and guestbook start without fabricated interactions', async ({ page }) => {
  await page.goto('/blog/getting-started');
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: '评论', exact: true })).toBeVisible();
  await expect(page.locator('.comment-section .community-card')).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText('@example.com');

  await page.goto('/blog/message');
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: 'Message', exact: true })).toBeVisible();
  await expect(page.locator('body')).not.toContainText('@example.com');
  await expect(page.getByText('邮件提醒')).toHaveCount(0);
  await expect(page.getByText('支持 Markdown')).toHaveCount(0);
  await expect(page.getByPlaceholder('验证码 3 + 5 = ?')).toHaveCount(0);
  await expect(page.getByPlaceholder('邮箱 / QQ *（不会公开）')).toHaveCount(0);
});

test('admin can open empty moderation queues', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Admin moderation flow runs once');

  await createAdminSession(page);

  await page.goto('/admin/comments');
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: '评论管理', exact: true })).toBeVisible();
  await expect(page.getByText('当前筛选下没有评论。')).toBeVisible();

  await page.goto('/admin/messages');
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: '留言管理', exact: true })).toBeVisible();
  await expect(page.getByText('当前筛选下没有留言。')).toBeVisible();
});
