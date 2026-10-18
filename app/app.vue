<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <BackToTopButton />
</template>

<script setup lang="ts">
import BackToTopButton from '~/components/shell/BackToTopButton.vue';
import { useSiteTheme } from '~/composables/useSiteTheme';

const { theme } = useSiteTheme();
const { data: homeResponse } = await useFetch<{
  data: { siteProfile: { siteTitle: string; siteDescription: string } };
}>('/api/v1/public/home', { key: 'public-home-meta' });

useHead(() => ({ htmlAttrs: { 'data-theme': theme.value } }));

usePageSeo(() => ({
  title: homeResponse.value?.data.siteProfile.siteTitle || 'Nookfolio',
  description:
    homeResponse.value?.data.siteProfile.siteDescription ||
    'Building products, tools and ideas on the internet.',
}));
</script>
