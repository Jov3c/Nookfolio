import type { SiteTheme } from '~/utils/theme-transition';
import {
  getNextTheme,
  getThemeTransitionGeometry,
  normalizeStoredTheme,
} from '~/utils/theme-transition';

const STORAGE_KEY = 'nookfolio-theme';
let activeTransition: { finished: Promise<void>; skipTransition: () => void } | null = null;

function readStoredTheme() {
  try {
    return normalizeStoredTheme(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function writeStoredTheme(theme: SiteTheme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // The visual theme still works when browser storage is unavailable.
  }
}

function applyDocumentTheme(theme: SiteTheme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

export function useSiteTheme() {
  const themeCookie = useCookie<SiteTheme | null>(STORAGE_KEY, {
    default: () => null,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
  const theme = useState<SiteTheme>(
    'site-theme',
    () => normalizeStoredTheme(themeCookie.value) ?? 'light',
  );
  const initialized = useState('site-theme-initialized', () => false);
  const isTransitioning = useState('site-theme-transitioning', () => false);

  function applyTheme(nextTheme: SiteTheme, persist = true) {
    theme.value = nextTheme;
    if (!import.meta.client) return;
    applyDocumentTheme(nextTheme);
    if (persist) {
      themeCookie.value = nextTheme;
      writeStoredTheme(nextTheme);
    }
  }

  function initializeTheme() {
    if (!import.meta.client || initialized.value) return;
    const storedTheme = readStoredTheme();
    applyTheme(storedTheme ?? normalizeStoredTheme(themeCookie.value) ?? 'light', false);
    initialized.value = true;
  }

  async function toggleTheme(event: MouseEvent, trigger: HTMLElement) {
    if (!import.meta.client || activeTransition) return;

    const nextTheme = getNextTheme(theme.value);
    const bounds = trigger.getBoundingClientRect();
    const pointX = event.detail === 0 ? bounds.left + bounds.width / 2 : event.clientX;
    const pointY = event.detail === 0 ? bounds.top + bounds.height / 2 : event.clientY;
    const { x, y, radius } = getThemeTransitionGeometry(
      pointX,
      pointY,
      window.innerWidth,
      window.innerHeight,
    );
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const startViewTransition = document.startViewTransition?.bind(document);

    if (!startViewTransition || reduceMotion) {
      applyTheme(nextTheme);
      return;
    }

    const direction = nextTheme === 'dark' ? 'to-dark' : 'to-light';
    document.documentElement.dataset.themeTransition = direction;
    isTransitioning.value = true;
    let transition: ReturnType<NonNullable<typeof document.startViewTransition>> | null = null;
    let circleAnimation: Animation | null = null;

    try {
      transition = startViewTransition(() => applyTheme(nextTheme));
      activeTransition = transition;
      await transition.ready;
      const expanding = direction === 'to-dark';
      circleAnimation = document.documentElement.animate(
        {
          clipPath: expanding
            ? [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`]
            : [`circle(${radius}px at ${x}px ${y}px)`, `circle(0px at ${x}px ${y}px)`],
        },
        {
          duration: 500,
          easing: 'linear',
          fill: 'both',
          pseudoElement: expanding ? '::view-transition-new(root)' : '::view-transition-old(root)',
        },
      );
      await transition.finished;
    } catch (error) {
      transition?.skipTransition();
      if (transition) await transition.finished.catch(() => undefined);
      applyTheme(nextTheme);
      if (error instanceof Error && error.name !== 'AbortError') console.error(error);
    } finally {
      circleAnimation?.cancel();
      activeTransition = null;
      isTransitioning.value = false;
      delete document.documentElement.dataset.themeTransition;
    }
  }

  onMounted(initializeTheme);

  return { isTransitioning: readonly(isTransitioning), theme: readonly(theme), toggleTheme };
}
