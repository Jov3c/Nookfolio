import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('About API contract', () => {
  it('exposes one public read and protected admin read/write handlers', () => {
    const publicRoute = read('server/api/v1/public/about.get.ts');
    const adminGet = read('server/api/v1/admin/about/index.get.ts');
    const adminPatch = read('server/api/v1/admin/about/index.patch.ts');
    const middleware = read('server/middleware/admin-auth.ts');

    expect(publicRoute).toContain('useAboutService().getPublic()');
    expect(adminGet).toContain('useAboutService().getAdmin()');
    expect(adminPatch).toContain('aboutProfileUpdateSchema.safeParse');
    expect(adminPatch).toContain('useAboutService().update(parsed.data)');
    expect(middleware).toContain("event.path.startsWith('/api/v1/admin/')");
  });
});
