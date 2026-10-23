import { describe, expect, it } from 'vitest';

import { useAdminActionState } from '../../app/composables/useAdminActionState';

describe('useAdminActionState', () => {
  it('manages action state and uses API or fallback error messages', async () => {
    const { busyKey, notice, errorMessage, getErrorMessage, runAction } =
      useAdminActionState('页面回退文案');
    notice.value = '旧成功提示';
    errorMessage.value = '旧错误提示';

    let activeState: [string, string, string] | undefined;
    await runAction('save', async () => {
      activeState = [busyKey.value, notice.value, errorMessage.value];
      throw { data: { error: { message: '接口错误文案' } } };
    });

    expect(activeState).toEqual(['save', '', '']);
    expect(errorMessage.value).toBe('接口错误文案');
    expect(busyKey.value).toBe('');

    await runAction('delete', async () => {
      throw new Error('unstructured error');
    });

    expect(errorMessage.value).toBe('页面回退文案');
    expect(busyKey.value).toBe('');
    expect(getErrorMessage({ data: { error: { message: '单独解析的接口错误' } } })).toBe(
      '单独解析的接口错误',
    );
    expect(getErrorMessage(new Error('unstructured error'), '单次操作回退文案')).toBe(
      '单次操作回退文案',
    );
  });
});
