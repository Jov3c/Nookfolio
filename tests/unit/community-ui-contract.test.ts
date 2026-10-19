import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('community interaction UI contract', () => {
  it('shares image captcha and remembered visitor identity across both forms', () => {
    const captcha = read('app/components/community/CaptchaField.vue');
    const identity = read('app/composables/useVisitorIdentity.ts');
    const comments = read('app/components/blog/CommentSection.vue');
    const messages = read('app/components/blog/MessageBoard.vue');

    expect(captcha).toContain('/api/v1/public/captcha');
    expect(captcha).toContain('刷新验证码');
    expect(identity).toContain('nookfolio-visitor-identity');
    expect(comments).toContain('<CommunityCaptchaField');
    expect(messages).toContain('<CommunityCaptchaField');
  });

  it('supports inline replies, private acknowledgement and deduplicated load more', () => {
    const comments = read('app/components/blog/CommentSection.vue');
    const messages = read('app/components/blog/MessageBoard.vue');

    expect(comments).toContain('mergeUniqueThreads');
    expect(messages).toContain('mergeUniqueThreads');
    expect(comments).toContain('回复');
    expect(messages).toContain('悄悄话仅博主可见');
    expect(comments).toContain('加载更多');
    expect(messages).toContain('加载更多');
  });
});
