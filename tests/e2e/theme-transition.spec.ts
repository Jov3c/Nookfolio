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
  await page.addInitScript(() => {
    if (!localStorage.getItem('nookfolio-theme')) localStorage.setItem('nookfolio-theme', 'light');
  });
});

test('every page shell exposes one theme toggle', async ({ page }) => {
  for (const route of publicRoutes) {
    await page.goto(route);
    await expect(page.getByRole('button', { name: '切换到暗色主题' })).toHaveCount(1);
  }
});

test('public page shells expose the Travelling link', async ({ page }) => {
  for (const route of ['/', '/projects', '/blog', '/about/timeline']) {
    await page.goto(route);
    const travelling = page.getByRole('link', { name: '开往其他独立博客' });
    await expect(travelling).toHaveCount(1);
    await expect(travelling).toHaveText('');
    await expect(travelling).toHaveAttribute('href', 'https://www.travellings.cn/go.html');
    await expect(travelling).toHaveAttribute('target', '_blank');
    await expect(travelling).toHaveAttribute('rel', 'noopener noreferrer');
  }
});

test('repeated circular transitions leave no animation on reused pseudo-elements', async ({
  page,
}) => {
  await page.goto('/');
  const supportsViewTransitions = await page.evaluate(
    () => typeof document.startViewTransition === 'function',
  );

  for (const expectedTheme of ['dark', 'light', 'dark', 'light']) {
    await page
      .getByRole('button', { name: `切换到${expectedTheme === 'dark' ? '暗色' : '亮色'}主题` })
      .click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', expectedTheme);
    await expect(
      page.getByRole('button', {
        name: `切换到${expectedTheme === 'dark' ? '亮色' : '暗色'}主题`,
      }),
    ).toBeVisible();
    if (supportsViewTransitions) {
      await expect
        .poll(() => page.evaluate(() => document.documentElement.dataset.themeTransition), {
          timeout: 2_000,
        })
        .toBeUndefined();
    }
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
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('button', { name: '切换到亮色主题' })).toBeVisible();
  await page.goto('/blog');

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('button', { name: '切换到亮色主题' })).toBeVisible();
});
