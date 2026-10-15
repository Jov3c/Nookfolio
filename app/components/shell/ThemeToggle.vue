<script setup lang="ts">
import { useSiteTheme } from '~/composables/useSiteTheme';

const button = ref<HTMLButtonElement | null>(null);
const { isTransitioning, theme, toggleTheme } = useSiteTheme();

function handleClick(event: MouseEvent) {
  if (button.value) void toggleTheme(event, button.value);
}
</script>

<template>
  <button
    ref="button"
    class="theme-toggle"
    type="button"
    :disabled="isTransitioning"
    :aria-label="theme === 'dark' ? '切换到亮色主题' : '切换到暗色主题'"
    :aria-pressed="theme === 'dark'"
    @click="handleClick"
  >
    <svg class="theme-toggle__sun" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3.5" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"
      />
    </svg>
    <svg class="theme-toggle__moon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 15.1A8.4 8.4 0 0 1 8.9 4a8.5 8.5 0 1 0 11.1 11.1Z" />
    </svg>
  </button>
</template>

<style scoped>
.theme-toggle {
  position: relative;
  display: grid;
  width: 38px;
  height: 38px;
  flex: 0 0 auto;
  padding: 0;
  place-items: center;
  overflow: hidden;
  border: 1px solid var(--color-line);
  border-radius: 50%;
  background: var(--color-panel);
  color: var(--color-text);
  cursor: pointer;
  transition:
    transform 140ms ease,
    border-color 200ms ease,
    background-color 200ms ease;
}

.theme-toggle:active {
  transform: scale(0.94);
}

.theme-toggle:disabled {
  cursor: wait;
}

.theme-toggle svg {
  position: absolute;
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
  transition:
    transform 240ms cubic-bezier(0.23, 1, 0.32, 1),
    opacity 160ms ease;
}

.theme-toggle__moon {
  opacity: 0;
  transform: rotate(-35deg) scale(0.82);
}

:global(html[data-theme='dark']) .theme-toggle__sun {
  opacity: 0;
  transform: rotate(55deg) scale(0.82);
}

:global(html[data-theme='dark']) .theme-toggle__moon {
  opacity: 1;
  transform: rotate(0deg) scale(1);
}

:global(html[data-theme-transition]) .theme-toggle,
:global(html[data-theme-transition]) .theme-toggle svg {
  transition: none;
}

@media (prefers-reduced-motion: reduce) {
  .theme-toggle,
  .theme-toggle svg {
    transition: none;
  }
}
</style>
