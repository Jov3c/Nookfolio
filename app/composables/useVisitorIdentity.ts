const STORAGE_KEY = 'nookfolio-visitor-identity';

interface VisitorIdentity {
  nickname: string;
  email: string;
}

export function useVisitorIdentity() {
  const nickname = ref('');
  const email = ref('');

  onMounted(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY) ?? '{}',
      ) as Partial<VisitorIdentity>;
      nickname.value = typeof saved.nickname === 'string' ? saved.nickname : '';
      email.value = typeof saved.email === 'string' ? saved.email : '';
    } catch {
      // Private browsing and blocked storage do not prevent posting.
    }
  });

  watch([nickname, email], () => {
    if (!import.meta.client) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ nickname: nickname.value, email: email.value }),
      );
    } catch {
      // Keep the in-memory identity when storage is unavailable.
    }
  });

  return { nickname, email };
}
