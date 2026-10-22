<script setup lang="ts">
import { getAdminNavigationState, isAdminRouteActive } from '~/utils/admin-navigation';
const route = useRoute();
const state = computed(() => getAdminNavigationState(route.path));
</script>

<template>
  <nav class="admin-secondary-nav" aria-label="当前分区页面">
    <NuxtLink
      v-for="(item, index) in state.secondaryItems"
      :key="item.to"
      :to="item.to"
      :data-active="isAdminRouteActive(route.path, item.to)"
    >
      <span aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
      <strong>{{ item.label }}</strong>
    </NuxtLink>
  </nav>
</template>
