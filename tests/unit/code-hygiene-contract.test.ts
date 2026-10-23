import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const root = process.cwd();

describe('code hygiene', () => {
  it('does not keep unused legacy UI components or domain types', () => {
    for (const path of [
      'app/components/ui/AppButton.vue',
      'app/components/ui/EmptyState.vue',
      'app/components/ui/SurfaceCard.vue',
      'app/types/content.ts',
    ]) {
      expect(existsSync(resolve(root, path)), path).toBe(false);
    }
  });
});
