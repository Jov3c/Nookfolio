<script setup lang="ts">
import SiteBrand from '~/components/shell/SiteBrand.vue';
import ThemeToggle from '~/components/shell/ThemeToggle.vue';
import TravellingLink from '~/components/shell/TravellingLink.vue';
import { primaryNavigation } from '~/data/navigation';
</script>

<template>
  <div class="blog-prototype-shell">
    <header class="blog-prototype-topbar">
      <div class="blog-prototype-topbar__inner">
        <SiteBrand class="blog-prototype-brand" />
        <nav class="blog-prototype-nav" aria-label="主导航">
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
