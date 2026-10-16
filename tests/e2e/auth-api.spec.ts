import { expect, test } from '@playwright/test';
import { createAdminSession } from '../fixtures/admin-session';

const adminEmail = process.env.ADMIN_EMAIL ?? 'stage02-admin@example.com';

test('auth API rejects bad credentials and invalidates a database session on logout', async ({
  request,
  browser,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'desktop-chromium',
    'API contract runs once per browser engine',
  );
  const invalid = await request.post('/api/v1/auth/login', {
    headers: { 'x-forwarded-for': '10.0.0.22' },
    data: { email: adminEmail, password: 'incorrect-password' },
  });
  expect(invalid.status()).toBe(401);
  await expect(invalid.json()).resolves.toMatchObject({ error: { code: 'INVALID_CREDENTIALS' } });

  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();
  await createAdminSession(page);

  const me = await page.request.get('/api/v1/auth/me');
  expect(me.status()).toBe(200);
  await expect(me.json()).resolves.toMatchObject({ data: { admin: { email: adminEmail } } });

  const protectedRoute = await page.request.get('/api/v1/admin/session');
  expect(protectedRoute.status()).toBe(200);

  const forbidden = await page.request.post('/api/v1/auth/logout', {
    headers: { Origin: 'https://attacker.example' },
  });
  expect(forbidden.status()).toBe(403);

  const logout = await page.request.post('/api/v1/auth/logout');
  expect(logout.status()).toBe(200);
  const afterLogout = await page.request.get('/api/v1/auth/me');
  expect(afterLogout.status()).toBe(401);
  await context.close();
});

test('protected admin APIs reject anonymous requests', async ({ playwright }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'desktop-chromium',
    'API contract runs once per browser engine',
  );
  const anonymous = await playwright.request.newContext({
    baseURL: 'https://127.0.0.1:3000',
    ignoreHTTPSErrors: true,
  });
  const response = await anonymous.get('/api/v1/admin/session');
  expect(response.status()).toBe(401);
  await anonymous.dispose();
});
