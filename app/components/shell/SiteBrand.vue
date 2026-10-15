<script setup lang="ts">
import type { PublicHomeData, PublicHomeResponse } from '~/types/home';

const props = withDefaults(
  defineProps<{
    to?: string;
    profile?: PublicHomeData['siteProfile'] | null;
    ariaLabel?: string;
  }>(),
  { to: '/', profile: null, ariaLabel: '返回首页' },
);

const { data } = await useFetch<PublicHomeResponse>('/api/v1/public/home', {
  key: 'public-home-brand',
});
const profile = computed(() => props.profile ?? data.value?.data.siteProfile ?? null);
const text = computed(() => profile.value?.brandText || 'JOV3');
</script>

<template>
  <NuxtLink class="site-brand" :to="to" :aria-label="ariaLabel">
    <img
      v-if="profile?.brandIcon"
      class="site-brand__icon"
      :src="profile.brandIcon.url"
      :alt="profile.brandIcon.altText || ''"
    />
    <i v-else class="site-brand__fallback" aria-hidden="true" />
    <span class="site-brand__text">{{ text }}</span>
  </NuxtLink>
</template>
