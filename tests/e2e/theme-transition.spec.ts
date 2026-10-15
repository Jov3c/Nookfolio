import { expect, test } from '@playwright/test';

const publicRoutes = [
  '/',
  '/projects',
  '/blog',
  '/blog/archive',
  '/blog/links',
  '/blog/message',
  '/about/timeline',
  '/about/cv',
  '/admin/login',
  '/theme-toggle-missing-page',
];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('nookfolio-theme', 'light'));
});

test('every page shell exposes one theme toggle', async ({ page }) => {
  for (const route of publicRoutes) {
    await page.goto(route);
    await expect(page.getByRole('button', { name: '切换到暗色主题' })).toHaveCount(1);
  }
});

test('repeated circular transitions leave no animation on reused pseudo-elements', async ({
  page,
}) => {
  await page.goto('/');

  for (const expectedTheme of ['dark', 'light', 'dark', 'light']) {
    await page
      .getByRole('button', { name: `切换到${expectedTheme === 'dark' ? '暗色' : '亮色'}主题` })
      .click();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.dataset.themeTransition))
      .toBe(expectedTheme === 'dark' ? 'to-dark' : 'to-light');
    await page.waitForTimeout(550);
    await expect(page.locator('html')).toHaveAttribute('data-theme', expectedTheme);
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document
              .getAnimations({ subtree: true })
              .filter(
                (animation) =>
                  animation.effect instanceof KeyframeEffect &&
                  animation.effect.pseudoElement?.includes('view-transition') &&
                  animation.playState !== 'idle',
              ).length,
        ),
      )
      .toBe(0);
  }
});

test('selected theme persists across public routes', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '切换到暗色主题' }).click();
  await page.waitForTimeout(550);
  await page.goto('/blog');

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('button', { name: '切换到亮色主题' })).toBeVisible();
});
