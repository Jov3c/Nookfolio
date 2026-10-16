<script setup lang="ts">
import { primaryNavigation } from '~/data/navigation';
import ThemeToggle from './ThemeToggle.vue';
import TravellingLink from './TravellingLink.vue';
</script>

<template>
  <nav class="main-nav" aria-label="主导航">
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
