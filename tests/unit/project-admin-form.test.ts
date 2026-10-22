import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  resolve(import.meta.dirname, '../../app/pages/admin/projects.vue'),
  'utf8',
);

describe('project admin form', () => {
  it('always handles create clicks and reports missing required fields inline', () => {
    expect(source).toContain('function validateProjectForm()');
    expect(source).toContain('请填写项目名称。');
    expect(source).toContain('请填写路径标识。');
    expect(source).toContain('请填写项目摘要。');
    expect(source).toMatch(/<form[\s\S]*?novalidate[\s\S]*?@submit\.prevent="saveProject"/);
    expect(source).toContain('class="admin-error project-editor__error"');
  });
});
