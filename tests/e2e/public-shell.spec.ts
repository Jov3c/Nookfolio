import { expect, test } from '@playwright/test';

async function expectNoHorizontalOverflow(page: import('@playwright/test').Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
}

test('home presents the personal entry points', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/你的名字 — 请填写个人身份/);
  await expect(page.getByRole('heading', { name: '你的名字', exact: true })).toBeVisible();
  const entries = page.getByRole('navigation', { name: '站点入口' });
  const links = entries.getByRole('link');
  await expect(links).toHaveCount(4);
  await expect(links.nth(0)).toHaveAttribute('href', '/blog');
  await expect(links.nth(1)).toHaveAttribute('href', '/projects');
  await expect(links.nth(2)).toHaveAttribute('href', '/about/cv');
  await expect(links.nth(3)).toHaveAttribute('href', '/about');
  await expectNoHorizontalOverflow(page);
});

test('projects open a README-style detail page', async ({ page }) => {
  await page.goto('/projects');

  await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
  await expect(page.getByText(/共\s*\d+\s*个项目/)).toBeVisible();
  await page.getByRole('link', { name: /示例项目/ }).click();
  await expect(page).toHaveURL(/\/projects\/example-project$/);
  await expect(
    page.locator('.project-prototype-readme').getByRole('heading', { name: '示例项目' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: '项目详情' })).toBeVisible();
  await expect(page.getByText('README.md', { exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test('blog cards become visible after the prototype loading state', async ({ page }) => {
  await page.goto('/blog');

  await expect(page.locator('.blog-prototype-topbar')).toBeVisible();
  await expect(page.locator('.post-card').first()).toBeVisible();
});
