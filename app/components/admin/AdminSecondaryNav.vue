<script setup lang="ts">
import { getAdminNavigationState, isAdminRouteActive } from '~/utils/admin-navigation';
const route = useRoute();
const state = computed(() => getAdminNavigationState(route.path));
</script>

<template>
  <nav v-if="state.secondaryItems.length > 1" class="admin-secondary-nav" aria-label="后台二级导航">
    <NuxtLink
      v-for="item in state.secondaryItems"
      :key="item.to"
      :to="item.to"
      :data-active="isAdminRouteActive(route.path, item.to)"
    >
      {{ item.label }}
    </NuxtLink>
  </nav>
</template>
