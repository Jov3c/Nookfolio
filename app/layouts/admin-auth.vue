<script setup lang="ts">
import SiteBrand from '~/components/shell/SiteBrand.vue';
import ThemeToggle from '~/components/shell/ThemeToggle.vue';
</script>

<template>
  <div class="admin-auth-layout">
    <SiteBrand class="admin-auth-brand" to="/admin" aria-label="返回管理后台" />
    <ThemeToggle class="admin-auth-theme-toggle" />
    <slot />
    <p class="admin-auth-caption">仅限授权管理员访问</p>
  </div>
</template>

<style src="~/assets/css/admin.css"></style>
