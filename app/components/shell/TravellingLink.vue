<script setup lang="ts">
const isOpen = ref(false);
const root = ref<HTMLElement | null>(null);
const trigger = ref<HTMLButtonElement | null>(null);

function togglePopover() {
  isOpen.value = !isOpen.value;
}

function closePopover() {
  isOpen.value = false;
}

function onClickOutside(event: MouseEvent) {
  if (!root.value?.contains(event.target as Node)) closePopover();
}

function onKeyStroke(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !isOpen.value) return;
  closePopover();
  trigger.value?.focus();
}

onMounted(() => {
  document.addEventListener('click', onClickOutside);
  document.addEventListener('keydown', onKeyStroke);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside);
  document.removeEventListener('keydown', onKeyStroke);
});
</script>

<template>
  <div ref="root" class="travelling">
    <button
      ref="trigger"
      class="travelling-link"
      type="button"
      aria-label="探索独立博客"
      title="探索独立博客"
      aria-haspopup="menu"
      :aria-expanded="isOpen"
      @click="togglePopover"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M7 16.5h10M8 20l-2 2m10-2 2 2M7 3.5h10a2 2 0 0 1 2 2v10a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-10a2 2 0 0 1 2-2Z"
        />
        <path d="M5 9h14M8.5 14h.01M15.5 14h.01M9 3.5v-1h6v1" />
      </svg>
    </button>

    <Transition name="route-popover">
      <section v-if="isOpen" class="route-popover" role="menu" aria-label="博客漫游路线">
        <header class="route-popover__header">
          <span>选择漫游路线</span>
          <span>ONLINE</span>
        </header>
        <div class="route-popover__list">
          <a
            class="route-option"
            href="https://www.travellings.cn/go.html"
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            @click="closePopover"
          >
            <span class="route-option__dot" aria-hidden="true" />
            <span>
              <strong>开往</strong>
              <small>随机前往一座独立博客</small>
            </span>
            <span class="route-option__code">TR-01</span>
          </a>
          <a
            class="route-option"
            href="https://www.foreverblog.cn/go.html"
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            @click="closePopover"
          >
            <span class="route-option__dot" aria-hidden="true" />
            <span>
              <strong>十年之约虫洞</strong>
              <small>遇见仍在更新的成员博客</small>
            </span>
            <span class="route-option__code">WH-10</span>
          </a>
        </div>
      </section>
    </Transition>
  </div>
</template>

<style scoped>
.travelling {
  position: relative;
  display: inline-flex;
}

.travelling-link {
  display: inline-flex;
  width: 40px;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--color-muted);
  line-height: 1;
  cursor: pointer;
  transition:
    color 180ms ease-out,
    background-color 180ms ease-out;
}

.travelling-link:hover,
.travelling-link[aria-expanded='true'] {
  background: var(--color-accent-soft);
  color: var(--color-text);
}

.travelling-link:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.travelling-link svg {
  width: 17px;
  height: 17px;
  flex: 0 0 auto;
  fill: none;
  stroke: currentcolor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
}

.route-popover {
  position: absolute;
  z-index: 80;
  top: calc(100% + 8px);
  right: 0;
  width: 310px;
  padding: 14px 12px 12px;
  border: 1px solid var(--color-border);
  border-radius: 17px;
  background: var(--color-surface);
  box-shadow: 0 18px 48px rgb(23 25 23 / 11%);
  transform-origin: top right;
}

.route-popover__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 6px 12px;
  color: var(--color-text);
  font-size: 0.7rem;
  font-weight: 600;
}

.route-popover__header span:last-child,
.route-option__code {
  color: var(--color-muted);
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 0.58rem;
  font-weight: 500;
  letter-spacing: 0.04em;
}

.route-popover__list {
  position: relative;
}

.route-popover__list::before {
  position: absolute;
  top: 25px;
  bottom: 25px;
  left: 22px;
  width: 1px;
  background: var(--color-border);
  content: '';
}

.route-option {
  position: relative;
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  padding: 10px 9px;
  border-radius: 11px;
  color: var(--color-text);
  text-decoration: none;
  transition: background-color 160ms ease-out;
}

.route-option:hover,
.route-option:focus-visible {
  background: var(--color-accent-soft);
}

.route-option:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}

.route-option__dot {
  z-index: 1;
  display: grid;
  width: 26px;
  height: 26px;
  place-items: center;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: var(--color-surface);
}

.route-option__dot::after {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--color-accent);
  content: '';
}

.route-option strong,
.route-option small {
  display: block;
}

.route-option strong {
  font-size: 0.8rem;
}

.route-option small {
  margin-top: 3px;
  overflow: hidden;
  color: var(--color-muted);
  font-size: 0.65rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.route-popover-enter-active,
.route-popover-leave-active {
  transition:
    opacity 180ms ease-out,
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.route-popover-enter-from,
.route-popover-leave-to {
  opacity: 0;
  transform: translateY(-7px) scale(0.98);
}

@media (max-width: 700px) {
  .route-popover {
    right: -44px;
    width: min(310px, calc(100vw - 28px));
  }
}

@media (prefers-reduced-motion: reduce) {
  .travelling-link,
  .route-option,
  .route-popover-enter-active,
  .route-popover-leave-active {
    transition: none;
  }
}
</style>
