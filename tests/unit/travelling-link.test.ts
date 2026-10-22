import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const source = readFileSync(
  resolve(import.meta.dirname, '../../app/components/shell/TravellingLink.vue'),
  'utf8',
);

describe('travelling link popover', () => {
  it('opens three official independent-blog routes in the selected order', () => {
    expect(source).toContain('<button');
    expect(source).toContain('aria-haspopup="menu"');
    const travelling = source.indexOf('https://www.travellings.cn/go.html');
    const blogscn = source.indexOf('https://blogscn.fun/random.html');
    const forever = source.indexOf('https://www.foreverblog.cn/go.html');

    expect(travelling).toBeGreaterThan(-1);
    expect(blogscn).toBeGreaterThan(travelling);
    expect(forever).toBeGreaterThan(blogscn);
    expect(source).toContain('https://www.travellings.cn/assets/logo.gif');
    expect(source).toContain('https://photo.xiangming.site/img/footer.gif');
    expect(source).toContain('https://www.foreverblog.cn/assets/logo/wormhole_v2_dark.webp');
    expect(source).toContain('width: 188px');
  });

  it('supports dismissing the route popover', () => {
    expect(source).toContain('onClickOutside');
    expect(source).toContain("event.key !== 'Escape'");
    expect(source).toContain("document.addEventListener('keydown', onKeyStroke)");
  });

  it('uses an opaque project color so the topbar divider cannot show through', () => {
    expect(source).toContain('background: var(--color-panel)');
    expect(source).not.toContain('background: var(--color-surface)');
  });
});
