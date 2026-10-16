import { expect, test } from '@playwright/test';
import { createAdminSession } from '../fixtures/admin-session';

test('admin can add a homepage entry and the public page reads it from the API', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Homepage configuration flow runs once');

  await createAdminSession(page);

  let createdId = '';
  try {
    await page.goto('/admin/home');
    await expect(page.getByRole('heading', { name: '首页资料' })).toBeVisible();
    const entryForm = page.locator('form.home-new-entry').first();
    await entryForm.getByLabel('标题').fill('Stage 04 Custom');
    await entryForm.getByLabel('描述').fill('A configurable homepage destination.');
    await entryForm.getByLabel('地址').fill('/projects');
    await entryForm.getByRole('button', { name: '添加入口' }).click();
    await expect(page.getByRole('status')).toContainText('首页入口已新增');

    const entriesResponse = await page.request.get('/api/v1/admin/home-entries');
    const entries = (await entriesResponse.json()).data as Array<{ id: string; title: string }>;
    createdId = entries.find((entry) => entry.title === 'Stage 04 Custom')?.id ?? '';
    expect(createdId).not.toBe('');

    await page.goto('/');
    await expect(page.getByRole('link', { name: /Stage 04 Custom/ })).toBeVisible();

    const hidden = await page.request.patch(`/api/v1/admin/home-entries/${createdId}`, {
      data: { visible: false },
    });
    expect(hidden.ok()).toBe(true);
    await page.reload();
    await expect(page.getByRole('link', { name: /Stage 04 Custom/ })).toHaveCount(0);
  } finally {
    if (createdId) await page.request.delete(`/api/v1/admin/home-entries/${createdId}`);
  }
});

test('admin can change the shared site badge and receives a fading save notice', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Shared badge flow runs once');

  await createAdminSession(page);
  const original = (await (await page.request.get('/api/v1/admin/site-profile')).json()).data as {
    brandText: string;
  };

  try {
    await page.goto('/admin/home');
    await page.getByLabel('角标文字').fill('Stage Badge');
    await page.getByRole('button', { name: '保存站点资料' }).click();
    await expect(page.getByRole('status')).toContainText('站点信息已保存');

    await page.goto('/blog');
    await expect(page.locator('.site-brand')).toContainText('Stage Badge');

    await page.evaluate(() => window.scrollTo(0, 300));
    await expect(page.locator('html')).toHaveClass(/is-scroll-active/);
    await expect(page.locator('html')).not.toHaveClass(/is-scroll-active/, { timeout: 2_000 });
  } finally {
    await page.request.patch('/api/v1/admin/site-profile', {
      data: { brandText: original.brandText },
    });
  }
});
