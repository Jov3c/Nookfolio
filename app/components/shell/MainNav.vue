<script setup lang="ts">
import { primaryNavigation } from '~/data/navigation';
import { useMovingNavIndicator } from '~/composables/useMovingNavIndicator';
import ThemeToggle from './ThemeToggle.vue';
import TravellingLink from './TravellingLink.vue';

const nav = ref<HTMLElement | null>(null);
useMovingNavIndicator(nav, '.nav-link.router-link-active');
</script>

<template>
  <nav ref="nav" class="main-nav motion-nav" aria-label="主导航">
    <span class="motion-nav__indicator" aria-hidden="true" />
    <NuxtLink
      v-for="item in primaryNavigation"
      :key="item.to"
      class="nav-link"
      :to="item.to"
      :aria-label="`${item.label} 页面`"
    >
      {{ item.label }}
    </NuxtLink>
    <TravellingLink />
    <ThemeToggle />
  </nav>
</template>
