<template>
  <a
    class="travelling-link"
    href="https://www.travellings.cn/go.html"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="开往其他独立博客"
    title="开往其他独立博客"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 16.5h10M8 20l-2 2m10-2 2 2M7 3.5h10a2 2 0 0 1 2 2v10a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-10a2 2 0 0 1 2-2Z"
      />
      <path d="M5 9h14M8.5 14h.01M15.5 14h.01M9 3.5v-1h6v1" />
    </svg>
    <span>开往</span>
    <span class="travelling-link__arrow" aria-hidden="true">↗</span>
  </a>
</template>

<style scoped>
.travelling-link {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 10px;
  color: var(--color-muted);
  font-size: 0.95rem;
  line-height: 1;
  text-decoration: none;
  transition:
    color 180ms ease,
    background-color 180ms ease;
}

.travelling-link:hover {
  background: var(--color-accent-soft);
  color: var(--color-text);
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

.travelling-link__arrow {
  font-size: 0.72em;
  transition: transform 180ms ease;
}

.travelling-link:hover .travelling-link__arrow {
  transform: translate(1px, -1px);
}

@media (max-width: 520px) {
  .travelling-link {
    width: 40px;
    justify-content: center;
    padding-inline: 0;
  }

  .travelling-link span {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .travelling-link,
  .travelling-link__arrow {
    transition: none;
  }
}
</style>
