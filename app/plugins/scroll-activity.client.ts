const ACTIVE_CLASS = 'is-scroll-active';
const IDLE_DELAY = 850;

export default defineNuxtPlugin(() => {
  const timers = new WeakMap<Element, ReturnType<typeof setTimeout>>();

  function markActive(event: Event) {
    const eventTarget = event.target;
    const target =
      eventTarget === document
        ? document.scrollingElement
        : eventTarget instanceof Element
          ? eventTarget
          : document.scrollingElement;
    if (!target) return;

    target.classList.add(ACTIVE_CLASS);
    const currentTimer = timers.get(target);
    if (currentTimer) clearTimeout(currentTimer);
    timers.set(
      target,
      setTimeout(() => target.classList.remove(ACTIVE_CLASS), IDLE_DELAY),
    );
  }

  document.addEventListener('scroll', markActive, { capture: true, passive: true });
});
