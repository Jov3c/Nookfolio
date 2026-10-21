import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const source = readFileSync(
  resolve(import.meta.dirname, '../../app/components/shell/TravellingLink.vue'),
  'utf8',
);

describe('travelling link popover', () => {
  it('opens two independent-blog routes from the train button', () => {
    expect(source).toContain('<button');
    expect(source).toContain('aria-haspopup="menu"');
    expect(source).toContain('https://www.travellings.cn/go.html');
    expect(source).toContain('https://www.foreverblog.cn/go.html');
    expect(source).toContain('十年之约虫洞');
  });

  it('supports dismissing the route popover', () => {
    expect(source).toContain('onClickOutside');
    expect(source).toContain("event.key !== 'Escape'");
    expect(source).toContain("document.addEventListener('keydown', onKeyStroke)");
  });
});
