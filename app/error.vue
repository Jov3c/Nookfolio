<script setup lang="ts">
import type { NuxtError } from '#app';
import SiteBrand from '~/components/shell/SiteBrand.vue';
import ThemeToggle from '~/components/shell/ThemeToggle.vue';
import ErrorState from '~/components/ui/ErrorState.vue';

const props = defineProps<{ error: NuxtError }>();
const isNotFound = computed(() => props.error.statusCode === 404);
const lostDot = ref<HTMLElement | null>(null);
const isReturning = ref(false);

useSeoMeta({ title: `${props.error.statusCode} — Nookfolio` });

function moveLostDot(event: PointerEvent) {
  const dot = lostDot.value;
  if (!dot || isReturning.value || event.pointerType !== 'mouse') return;

  const rect = dot.getBoundingClientRect();
  const dx = event.clientX - (rect.left + rect.width / 2);
  const dy = event.clientY - (rect.top + rect.height / 2);
  if (Math.hypot(dx, dy) >= 110) return;

  dot.style.left = `${Math.max(50, Math.min(window.innerWidth - 70, rect.left - dx * 0.6))}px`;
  dot.style.top = `${Math.max(80, Math.min(window.innerHeight - 90, rect.top - dy * 0.6))}px`;
}

function returnHome() {
  if (isReturning.value) return;
  isReturning.value = true;
  const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 720;
  window.setTimeout(() => clearError({ redirect: '/' }), delay);
}
</script>

<template>
  <main v-if="isNotFound" class="lost-page" @pointermove="moveLostDot">
    <SiteBrand class="lost-page__brand" />
    <ThemeToggle class="lost-page__theme-toggle" />
    <i
      ref="lostDot"
      class="lost-page__dot"
      :class="{ 'is-returning': isReturning }"
      aria-hidden="true"
    />

    <section class="lost-page__content" aria-labelledby="not-found-title">
      <div class="lost-page__number" aria-hidden="true">404</div>
      <div class="lost-page__copy">
        <p class="lost-page__eyebrow">NOT FOUND · 404</p>
        <h1 id="not-found-title">有个圆点走丢了。</h1>
        <p class="lost-page__description">
          它大概和你要找的页面去了同一个地方。先把它带回去，我们也一起回首页。
        </p>
        <NuxtLink class="lost-page__home" to="/" @click.prevent="returnHome">
          带它回家 <span aria-hidden="true">→</span>
        </NuxtLink>
      </div>
    </section>
  </main>

  <div v-else class="error-page">
    <ThemeToggle class="error-page__theme-toggle" />
    <ErrorState
      :code="error.statusCode"
      label="Something went wrong"
      title="A small interruption."
      description="页面暂时无法正常显示，请稍后再试。"
    >
      <NuxtLink class="button" to="/" @click="clearError({ redirect: '/' })">Back home</NuxtLink>
    </ErrorState>
  </div>
</template>

<style scoped>
.lost-page {
  position: relative;
  display: grid;
  min-height: 100svh;
  place-items: center;
  overflow: hidden;
  padding: 96px 24px;
  background:
    radial-gradient(circle at 22% 16%, rgb(127 138 118 / 10%), transparent 24%),
    var(--color-bg, #f5f6f3);
  color: var(--color-text, #171917);
}

.lost-page__brand {
  position: absolute;
  z-index: 20;
  top: 30px;
  left: clamp(24px, 5vw, 72px);
}

.lost-page__theme-toggle,
.error-page__theme-toggle {
  position: fixed;
  z-index: 30;
  top: 24px;
  right: clamp(24px, 5vw, 72px);
}

.lost-page__content {
  position: relative;
  width: min(900px, 100%);
  text-align: center;
}

.lost-page__number {
  display: inline-flex;
  margin-left: -0.08em;
  color: #e0e4dd;
  font-size: clamp(10rem, 30vw, 25rem);
  font-weight: 900;
  letter-spacing: -0.13em;
  line-height: 0.72;
  user-select: none;
}

.lost-page__dot {
  position: fixed;
  z-index: 8;
  top: 31%;
  left: 51%;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-accent, #7f8a76);
  box-shadow: 0 0 0 12px rgb(127 138 118 / 10%);
  pointer-events: none;
  transition:
    transform 420ms cubic-bezier(0.22, 1, 0.36, 1),
    top 650ms cubic-bezier(0.22, 1, 0.36, 1),
    left 650ms cubic-bezier(0.22, 1, 0.36, 1),
    width 300ms ease,
    height 300ms ease,
    box-shadow 300ms ease;
  animation: lost-float 3.8s ease-in-out infinite alternate;
}

.lost-page__dot.is-returning {
  top: 34px !important;
  left: calc(clamp(24px, 5vw, 72px) + 1px) !important;
  width: 8px;
  height: 8px;
  box-shadow: none;
  animation: none;
}

.lost-page__copy {
  position: relative;
  z-index: 10;
  margin-top: -6vh;
}

.lost-page__eyebrow {
  margin: 0 0 10px;
  color: var(--color-accent, #7f8a76);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.lost-page h1 {
  margin: 0;
  font-size: clamp(2rem, 5vw, 4.5rem);
  letter-spacing: -0.06em;
  line-height: 0.95;
}

.lost-page__description {
  max-width: 470px;
  margin: 20px auto 28px;
  color: var(--color-muted, #747a73);
  line-height: 1.8;
}

.lost-page__home {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  gap: 9px;
  padding: 10px 17px;
  border: 1px solid var(--color-text, #171917);
  border-radius: 999px;
  background: var(--color-text, #171917);
  color: #fff;
  font-size: 13px;
  font-weight: 720;
  text-decoration: none;
  transition:
    transform 180ms ease-out,
    background 180ms ease-out;
}

.lost-page__home:hover {
  background: #273028;
  transform: translateY(-2px);
}

.lost-page__home:active {
  transform: scale(0.97);
}

.lost-page__home:focus-visible {
  outline: 3px solid rgb(127 138 118 / 38%);
  outline-offset: 3px;
}

@keyframes lost-float {
  to {
    transform: translate(14px, -18px);
  }
}

@media (max-width: 680px) {
  .lost-page__brand {
    top: 22px;
  }

  .lost-page__copy {
    margin-top: 1vh;
  }

  .lost-page__dot.is-returning {
    top: 26px !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lost-page__dot,
  .lost-page__home {
    animation: none;
    transition-duration: 0.01ms;
  }
}
</style>
