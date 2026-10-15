import { expect, test } from '@playwright/test';

test('blog index exposes database-backed articles and category filtering', async ({
  page,
}, testInfo) => {
  await page.goto('/blog');
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { name: 'Blog', exact: true })).toBeVisible();
  const postsResponse = await page.request.get('/api/v1/public/posts?page=1&pageSize=20');
  const postsPayload = (await postsResponse.json()) as {
    data: {
      items: Array<{ excerpt: string; viewCount: number; commentCount: number; wordCount: number }>;
    };
  };
  const firstPost = postsPayload.data.items[0];
  expect(firstPost).toBeDefined();
  await expect(page.locator('.post-card').first()).toContainText(firstPost!.excerpt);
  await expect(page.locator('.post-card').first()).toContainText(`${firstPost!.viewCount}`);
  await expect(page.locator('.post-card').first()).toContainText(`${firstPost!.commentCount}`);
  await expect(page.locator('.post-card').first()).toContainText(`${firstPost!.wordCount} 字`);
  await expect(page.locator('.post-card')).toHaveCount(3);
  if (testInfo.project.name === 'desktop-chromium') {
    const card = page.locator('.post-card').first();
    const cover = card.locator('.post-card__cover');
    const content = card.locator('.post-card__content');
    await expect(card).toHaveCSS('display', 'grid');
    const [cardBox, coverBox, contentBox] = await Promise.all([
      card.boundingBox(),
      cover.boundingBox(),
      content.boundingBox(),
    ]);
    expect(cardBox).not.toBeNull();
    expect(coverBox).not.toBeNull();
    expect(contentBox).not.toBeNull();
    expect(coverBox!.width).toBeGreaterThanOrEqual(188);
    expect(coverBox!.width).toBeLessThanOrEqual(192);
    expect(contentBox!.x).toBeGreaterThan(coverBox!.x + coverBox!.width - 1);
    expect(cardBox!.height).toBeGreaterThanOrEqual(152);
    expect(cardBox!.height).toBeLessThanOrEqual(160);
  }
  await expect(page.getByRole('navigation', { name: '博客导航' }).getByRole('link')).toHaveCount(3);
  await page.getByRole('button', { name: '全部分类' }).click();
  await expect(page.locator('.category-option').filter({ hasText: '使用指南' })).toBeVisible();
  await page.locator('.category-option').filter({ hasText: '使用指南' }).click();
  await expect(page).toHaveURL(/category=guide/);
  await expect(page.getByRole('heading', { name: /开始使用你的个人网站/ })).toBeVisible();
  await page.goto('/blog');
  await page.getByRole('link', { name: /开始使用你的个人网站/ }).click();
  await expect(page).toHaveURL(/\/blog\/getting-started$/);
  await expect(page.locator('.article-page__header p')).toContainText(/\d+ 字/);
  await expect(page.locator('.article-page__header').getByRole('heading')).toContainText(
    '开始使用你的个人网站',
  );
});

test('blog utilities preserve archive, links, and guestbook semantics', async ({ page }) => {
  await page.goto('/blog/archive');
  await expect(page.getByRole('heading', { name: 'Archive', exact: true })).toBeVisible();
  await page.getByRole('link', { name: /开始使用你的个人网站/ }).click();
  await expect(page).toHaveURL(/\/blog\/getting-started$/);

  await page.goto('/blog/links');
  await expect(page.getByText('还没有公开的友链。')).toBeVisible();

  await page.goto('/blog/message');
  await expect(page.getByRole('heading', { name: 'Message', exact: true })).toBeVisible();
  await expect(page.getByText('想说点什么就留下来吧。', { exact: true })).toBeVisible();
  await expect(page.getByLabel('悄悄话')).toBeVisible();
});
