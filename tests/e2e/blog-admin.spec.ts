import { expect, test } from '@playwright/test';
import { createAdminSession } from '../fixtures/admin-session';

test('admin can create, publish, and remove a database-backed post', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Admin blog flow runs once');

  await createAdminSession(page);

  const suffix = Date.now();
  let createdId = '';
  try {
    await page.goto('/admin/write');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: '发布文章', exact: true })).toBeVisible();
    await page.getByRole('textbox', { name: '标题', exact: true }).fill(`Stage Six Post ${suffix}`);
    await page
      .getByRole('textbox', { name: '路径标识', exact: true })
      .fill(`stage-six-e2e-${suffix}`);
    await page
      .getByRole('textbox', { name: '摘要', exact: true })
      .fill('A post created by the Stage 06 browser flow.');
    await page
      .getByLabel('Markdown 源码')
      .fill(`# Stage Six E2E\n\nCreated from the admin editor.`);
    await page.getByRole('button', { name: '发布文章' }).click();
    await expect(page).toHaveURL(/\/admin\/posts/);

    const postsResponse = await page.request.get('/api/v1/admin/posts');
    const posts = (await postsResponse.json()).data as Array<{ id: string; slug: string }>;
    createdId = posts.find((post) => post.slug === `stage-six-e2e-${suffix}`)?.id ?? '';
    expect(createdId).not.toBe('');

    const publicResponse = await page.request.get(`/api/v1/public/posts/stage-six-e2e-${suffix}`);
    expect(publicResponse.ok()).toBe(true);
  } finally {
    if (createdId) await page.request.delete(`/api/v1/admin/posts/${createdId}`);
  }
});

test('admin categories page shows post usage before deletion', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Category editor flow runs once');

  await createAdminSession(page);

  await page.goto('/admin/categories');
  await expect(page.getByRole('heading', { name: '分类管理', exact: true })).toBeVisible();
  await expect(page.getByText(/篇文章$/).first()).toBeVisible();
});
