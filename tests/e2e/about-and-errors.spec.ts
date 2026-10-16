import { expect, test } from '@playwright/test';

test('about is standalone and keeps CV available separately', async ({ page }) => {
  await page.goto('/about');
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator('.about-editorial__hero h1')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Edit About' })).toHaveCount(0);

  await page.goto('/about/cv');
  await expect(page.getByRole('heading', { name: '个人简历' })).toBeVisible();
  await expect(page.getByText('示例公司')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Edit CV' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Reset' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '打印 / 导出 PDF' })).toBeVisible();
});

test('unknown content returns a useful 404 page', async ({ page }) => {
  const response = await page.goto('/projects/does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: '有个圆点走丢了。' })).toBeVisible();
  await expect(page.getByRole('link', { name: /带它回家/ })).toHaveAttribute('href', '/');
});
