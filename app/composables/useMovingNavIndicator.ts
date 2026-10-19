import type { Ref } from 'vue';

export function useMovingNavIndicator(
  container: Ref<HTMLElement | null>,
  activeSelector = '.router-link-active',
) {
  const route = useRoute();
  let resizeObserver: ResizeObserver | undefined;

  function updateIndicator() {
    const root = container.value;
    const active = root?.querySelector<HTMLElement>(activeSelector);
    if (!root || !active) {
      root?.classList.remove('has-nav-indicator');
      return;
    }

    root.style.setProperty('--nav-indicator-x', `${active.offsetLeft}px`);
    root.style.setProperty('--nav-indicator-y', `${active.offsetTop}px`);
    root.style.setProperty('--nav-indicator-width', `${active.offsetWidth}px`);
    root.style.setProperty('--nav-indicator-height', `${active.offsetHeight}px`);
    root.classList.add('has-nav-indicator');
  }

  watch(
    () => route.fullPath,
    () => nextTick(() => requestAnimationFrame(updateIndicator)),
  );

  onMounted(() => {
    requestAnimationFrame(() => {
      updateIndicator();
      requestAnimationFrame(() => container.value?.classList.add('is-nav-indicator-ready'));
    });
    resizeObserver = new ResizeObserver(updateIndicator);
    if (container.value) resizeObserver.observe(container.value);
  });

  onBeforeUnmount(() => resizeObserver?.disconnect());

  return { updateIndicator };
}
