<script setup lang="ts">
import { shouldShowBackToTop } from '~/utils/scroll-position';

const route = useRoute();
const visible = ref(false);
let frame = 0;

function updateVisibility() {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    visible.value = shouldShowBackToTop(
      window.scrollY,
      document.documentElement.scrollHeight,
      window.innerHeight,
    );
  });
}

function backToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

onMounted(() => {
  updateVisibility();
  window.addEventListener('scroll', updateVisibility, { passive: true });
  window.addEventListener('resize', updateVisibility, { passive: true });
});

watch(
  () => route.fullPath,
  async () => {
    await nextTick();
    updateVisibility();
  },
);

onBeforeUnmount(() => {
  cancelAnimationFrame(frame);
  window.removeEventListener('scroll', updateVisibility);
  window.removeEventListener('resize', updateVisibility);
});
</script>

<template>
  <button
    class="back-to-top"
    :class="{
      'back-to-top--visible': visible,
      'back-to-top--admin': route.path.startsWith('/admin'),
    }"
    type="button"
    aria-label="回到顶部"
    :aria-hidden="!visible"
    :tabindex="visible ? 0 : -1"
    @click="backToTop"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 14 6-6 6 6" />
    </svg>
  </button>
</template>
