<script setup lang="ts">
import {
  adminNavigation,
  getAdminNavigationState,
  getAdminNavIndicatorGeometry,
} from '~/utils/admin-navigation';

const route = useRoute();
const nav = ref<HTMLElement | null>(null);
const indicator = reactive({ width: '0px', transform: 'translate3d(0,0,0)', opacity: '0' });
const activeKey = computed(() => getAdminNavigationState(route.path).activeGroup.key);
let observer: ResizeObserver | null = null;

function updateIndicator() {
  const root = nav.value;
  const target = root?.querySelector<HTMLElement>('[data-active="true"]');
  if (!root || !target) return;
  const geometry = getAdminNavIndicatorGeometry(
    target.getBoundingClientRect(),
    root.getBoundingClientRect(),
  );
  indicator.width = `${geometry.width}px`;
  indicator.transform = `translate3d(${geometry.x}px,0,0)`;
  indicator.opacity = '1';
}

watch(
  () => route.path,
  async () => {
    await nextTick();
    requestAnimationFrame(updateIndicator);
  },
);
onMounted(() => {
  updateIndicator();
  observer = new ResizeObserver(updateIndicator);
  if (nav.value) observer.observe(nav.value);
});
onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <nav ref="nav" class="admin-primary-nav" aria-label="后台主导航">
    <span class="admin-primary-nav__indicator" :style="indicator" aria-hidden="true" />
    <NuxtLink
      v-for="group in adminNavigation"
      :key="group.key"
      :to="group.to"
      :data-active="activeKey === group.key"
    >
      {{ group.label }}
    </NuxtLink>
  </nav>
</template>
