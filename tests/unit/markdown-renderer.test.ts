import { describe, expect, it } from 'vitest';

import { renderMarkdown } from '../../shared/markdown';

describe('project Markdown renderer', () => {
  it('renders required GFM features and strips unsafe HTML and URLs', () => {
    const html = renderMarkdown(`
# 示例项目

- [x] shipped

| Name | Status |
| --- | --- |
| API | active |

[safe](https://example.com) [unsafe](javascript:alert(1))

![preview](https://example.com/preview.gif)

~~~ts
const status = 'active';
~~~

<script>alert('xss')</script>
`);

    expect(html).toContain('<h1>示例项目</h1>');
    expect(html).toContain('type="checkbox"');
    expect(html).toContain('<table>');
    expect(html).toContain('<pre>');
    expect(html).toContain('language-ts');
    expect(html).toContain('src="https://example.com/preview.gif"');
    expect(html).toContain('href="https://example.com"');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('javascript:');
  });

  it('renders !!content!! as keyboard-focusable spoiler text while preserving inline Markdown', () => {
    const html = renderMarkdown('阅读 !!隐藏 **重点**!!。');

    expect(html).toContain(
      '<span class="spoiler" tabindex="0" title="悬停或聚焦查看">隐藏 <strong>重点</strong></span>',
    );
  });
});
