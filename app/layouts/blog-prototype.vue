<script setup lang="ts">
import SiteBrand from '~/components/shell/SiteBrand.vue';
import ThemeToggle from '~/components/shell/ThemeToggle.vue';
import TravellingLink from '~/components/shell/TravellingLink.vue';
import { useMovingNavIndicator } from '~/composables/useMovingNavIndicator';
import { primaryNavigation } from '~/data/navigation';

const nav = ref<HTMLElement | null>(null);
useMovingNavIndicator(nav, 'a.router-link-active');
</script>

<template>
  <div class="blog-prototype-shell">
    <header class="blog-prototype-topbar">
      <div class="blog-prototype-topbar__inner">
        <SiteBrand class="blog-prototype-brand" />
        <nav ref="nav" class="blog-prototype-nav motion-nav" aria-label="主导航">
          <span class="motion-nav__indicator" aria-hidden="true" />
          <NuxtLink v-for="item in primaryNavigation" :key="item.to" :to="item.to">
            {{ item.label }}
          </NuxtLink>
          <TravellingLink />
          <ThemeToggle />
        </nav>
      </div>
    </header>
    <main id="main-content"><slot /></main>
  </div>
</template>

<style src="~/assets/css/prototype.css"></style>
