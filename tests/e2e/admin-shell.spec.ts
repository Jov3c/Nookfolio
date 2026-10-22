import { expect, test } from '@playwright/test';
import { createAdminSession } from '../fixtures/admin-session';

const adminEmail = process.env.ADMIN_EMAIL ?? 'stage02-admin@example.com';

async function signIn(page: import('@playwright/test').Page, forwardedFor: string) {
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': forwardedFor });
  await createAdminSession(page);
  await page.goto('/admin');
  await expect(page.locator('.admin-dashboard-intro h1')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true');
}

test('admin login protects the shell and logout invalidates access', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Admin auth flow runs once');
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': '10.0.0.21' });

  await page.goto('/admin');
  await expect(page).toHaveURL(
    (url) => url.pathname === '/admin/login' && url.searchParams.get('redirect') === '/admin',
  );
  await expect(page.getByRole('heading', { name: '欢迎回来' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true');

  await createAdminSession(page);
  await page.goto('/admin');
  await expect(page.locator('.admin-dashboard-intro h1')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true');
  await expect(page.getByText(adminEmail, { exact: true }).first()).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('admin_token'))).toBeNull();

  await page.getByRole('button', { name: '退出登录' }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto('/admin');
  await expect(page).toHaveURL(
    (url) => url.pathname === '/admin/login' && url.searchParams.get('redirect') === '/admin',
  );
});

test('mobile navigation exposes every admin destination and manages focus', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'Responsive admin shell runs once');
  await signIn(page, '10.0.0.22');

  const menuButton = page.getByRole('button', { name: '打开导航' });
  const primaryDestinations = ['概览', '内容', '资料', '互动'];

  for (const width of [390, 800, 900]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await menuButton.click();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('link', { name: '概览', exact: true })).toBeFocused();
    for (const name of primaryDestinations) {
      await expect(
        page.locator('#admin-primary-navigation').getByRole('link', { name, exact: true }),
      ).toBeVisible();
    }
    await page.keyboard.press('Escape');
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await expect(menuButton).toBeFocused();
  }
});

test('desktop navigation keeps the active primary group and indexed secondary route visible', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Desktop admin navigation runs once');
  await signIn(page, '10.0.0.23');
  await page.goto('/admin/posts');
  await expect(page.getByRole('heading', { name: '文章管理' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true');

  const contentGroup = page.locator('#admin-primary-navigation').getByRole('link', {
    name: '内容',
    exact: true,
  });
  const postsLink = page
    .getByRole('navigation', { name: '当前分区页面' })
    .getByRole('link', { name: /03\s*文章管理/ });
  const indicator = page.locator('.admin-primary-nav__indicator');

  await expect(contentGroup).toHaveAttribute('data-active', 'true');
  await expect(postsLink).toBeVisible();
  await expect(indicator).toBeVisible();
  await expect(postsLink).toHaveAttribute('data-active', 'true');
});
