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
        <a
          class="route-option"
          href="https://www.travellings.cn/go.html"
          target="_blank"
          rel="noopener noreferrer"
          role="menuitem"
          title="开往 · 友链接力"
          @click="closePopover"
        >
          <img
            src="https://www.travellings.cn/assets/logo.gif"
            alt="开往 · 友链接力"
            decoding="async"
            referrerpolicy="no-referrer"
          />
        </a>
        <a
          class="route-option"
          href="https://blogscn.fun/random.html"
          target="_blank"
          rel="noopener noreferrer"
          role="menuitem"
          title="笔墨迹 · 随机穿梭"
          @click="closePopover"
        >
          <img
            src="https://photo.xiangming.site/img/footer.gif"
            alt="笔墨迹 · 随机穿梭"
            decoding="async"
            referrerpolicy="no-referrer"
          />
        </a>
        <a
          class="route-option"
          href="https://www.foreverblog.cn/go.html"
          target="_blank"
          rel="noopener noreferrer"
          role="menuitem"
          title="十年之约虫洞"
          @click="closePopover"
        >
          <img
            class="route-option__logo route-option__logo--light"
            src="https://www.foreverblog.cn/assets/logo/wormhole_v2_dark.webp"
            alt="十年之约虫洞"
            decoding="async"
            referrerpolicy="no-referrer"
          />
          <img
            class="route-option__logo route-option__logo--dark"
            src="https://www.foreverblog.cn/assets/logo/wormhole_v2_light.webp"
            alt=""
            decoding="async"
            referrerpolicy="no-referrer"
          />
        </a>
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
  width: 188px;
  padding: 5px 7px;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-surface);
  box-shadow: 0 18px 42px rgb(23 25 23 / 12%);
  transform-origin: top right;
}

.route-option {
  position: relative;
  display: grid;
  min-height: 44px;
  place-items: center;
  padding: 6px 8px;
  border-bottom: 1px dashed var(--color-border);
  border-radius: 10px;
  color: var(--color-text);
  text-decoration: none;
  transition: background-color 160ms ease-out;
}

.route-option:last-child {
  border-bottom-color: transparent;
}

.route-option:hover,
.route-option:focus-visible {
  background: var(--color-accent-soft);
}

.route-option:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}

.route-option img {
  display: block;
  max-width: 138px;
  max-height: 26px;
  object-fit: contain;
  object-position: center;
}

.route-option__logo--dark {
  display: none !important;
}

:global(html[data-theme='dark']) .route-option__logo--light {
  display: none;
}

:global(html[data-theme='dark']) .route-option__logo--dark {
  display: block !important;
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
