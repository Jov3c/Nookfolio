import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('project and blog page presentation', () => {
  it('uses the requested page descriptions', () => {
    expect(read('app/pages/projects/index.vue')).toContain('description="项目卡片集"');
    expect(read('app/pages/blog/index.vue')).toContain('description="记录想法和生活"');
  });

  it('keeps project cards static without press tilt or spotlight behavior', () => {
    const card = read('app/components/projects/ProjectCard.vue');
    const css = read('app/assets/css/public.css');

    expect(card).not.toMatch(/project-card-motion|pointerdown|pointermove|pointercancel/);
    expect(card).not.toMatch(/project-card__press-light|project-card--pressing/);
    expect(css).not.toMatch(/project-card__press-light|project-card--pressing/);
    expect(existsSync(resolve(root, 'app/utils/project-card-motion.ts'))).toBe(false);
  });
});
