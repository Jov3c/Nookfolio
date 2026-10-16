import { expect, test } from '@playwright/test';
import { createAdminSession } from '../fixtures/admin-session';

const adminEmail = process.env.ADMIN_EMAIL ?? 'stage02-admin@example.com';

async function signIn(page: import('@playwright/test').Page, forwardedFor: string) {
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': forwardedFor });
  await createAdminSession(page);
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: '仪表盘' })).toBeVisible();
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
  await expect(page.getByRole('heading', { name: '仪表盘' })).toBeVisible();
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
  const closeButton = page.getByRole('button', { name: '关闭导航' }).last();
  const destinations = [
    '仪表盘',
    '文章管理',
    '分类管理',
    '项目管理',
    '时间线',
    '首页资料',
    '个人简历',
    'About 页面',
    '评论管理',
    '留言管理',
    '友链管理',
    '媒体库',
  ];

  for (const width of [390, 800, 900]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await menuButton.click();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    await expect(closeButton).toBeFocused();
    for (const groupName of ['内容管理', '资料管理', '互动管理', '系统管理']) {
      const group = page.getByRole('button', { name: groupName });
      if ((await group.getAttribute('aria-expanded')) === 'false') await group.click();
    }
    for (const name of destinations) {
      await expect(page.getByRole('link', { name, exact: true })).toBeVisible();
    }
    await page.keyboard.press('Escape');
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await expect(menuButton).toBeFocused();
  }
});

test('desktop navigation groups collapse and the active indicator follows the route', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Desktop admin navigation runs once');
  await signIn(page, '10.0.0.23');
  await page.goto('/admin/posts');
  await expect(page.getByRole('heading', { name: '文章管理' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true');

  const contentGroup = page.getByRole('button', { name: '内容管理' });
  const postsLink = page.getByRole('link', { name: '文章管理', exact: true });
  const indicator = page.locator('.admin-nav-indicator');

  await expect(contentGroup).toHaveAttribute('aria-expanded', 'false');
  await expect(postsLink).toBeHidden();
  await expect(indicator).toHaveCSS('opacity', '0');
  await contentGroup.click();
  await expect(contentGroup).toHaveAttribute('aria-expanded', 'true');
  await expect(postsLink).toBeVisible();

  await postsLink.click();
  await expect(page).toHaveURL(/\/admin\/posts$/);
  await expect(indicator).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const active = document.querySelector<HTMLElement>(
          '.admin-nav-link.router-link-exact-active',
        );
        const highlight = document.querySelector<HTMLElement>('.admin-nav-indicator');
        if (!active || !highlight) return false;
        const activeRect = active.getBoundingClientRect();
        const highlightRect = highlight.getBoundingClientRect();
        return (
          Math.abs(activeRect.top - highlightRect.top) < 1 &&
          Math.abs(activeRect.height - highlightRect.height) < 1
        );
      }),
    )
    .toBe(true);

  await contentGroup.click();
  await expect(contentGroup).toHaveAttribute('aria-expanded', 'false');
  await expect(postsLink).toBeHidden();
  await expect(indicator).toHaveCSS('opacity', '0');
});
