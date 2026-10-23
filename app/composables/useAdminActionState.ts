import { ref } from 'vue';

type FetchError = {
  data?: {
    error?: {
      message?: string;
    };
  };
};

export function useAdminActionState(fallbackMessage: string) {
  const busyKey = ref('');
  const notice = ref('');
  const errorMessage = ref('');

  function getErrorMessage(error: unknown, fallback = fallbackMessage) {
    return (error as FetchError).data?.error?.message || fallback;
  }

  async function runAction(key: string, action: () => Promise<void>) {
    busyKey.value = key;
    notice.value = '';
    errorMessage.value = '';
    try {
      await action();
    } catch (error) {
      errorMessage.value = getErrorMessage(error);
    } finally {
      busyKey.value = '';
    }
  }

  return { busyKey, notice, errorMessage, getErrorMessage, runAction };
}
