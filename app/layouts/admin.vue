<script setup lang="ts">
import { Toaster } from 'vue-sonner';
import 'vue-sonner/style.css';
import SiteBrand from '~/components/shell/SiteBrand.vue';
import ThemeToggle from '~/components/shell/ThemeToggle.vue';

const admin = useAdminSession();
const isSigningOut = ref(false);
const isMobileOpen = ref(false);

async function signOut() {
  isSigningOut.value = true;
  try {
    await $fetch('/api/v1/auth/logout', { method: 'POST' });
    admin.value = null;
    window.location.assign('/admin/login');
  } finally {
    isSigningOut.value = false;
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') isMobileOpen.value = false;
}
onMounted(() => window.addEventListener('keydown', handleKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown));
</script>

<template>
  <div class="admin-root">
    <Toaster position="bottom-right" :duration="2500" close-button rich-colors />
    <div class="admin-layout">
      <header class="admin-floating-bar">
        <SiteBrand to="/admin" aria-label="返回概览仪表盘" />
        <AdminPrimaryNav
          :class="{ 'admin-primary-nav--open': isMobileOpen }"
          @click="isMobileOpen = false"
        />
        <div class="admin-floating-bar__actions">
          <NuxtLink class="admin-view-site" to="/" target="_blank">查看站点</NuxtLink>
          <ThemeToggle />
          <button
            class="admin-identity-button"
            type="button"
            :title="admin?.email"
            :disabled="isSigningOut"
            @click="signOut"
          >
            {{ isSigningOut ? '…' : admin?.displayName.slice(0, 2).toUpperCase() }}
          </button>
          <button
            class="admin-mobile-menu"
            type="button"
            aria-label="打开导航"
            :aria-expanded="isMobileOpen"
            @click="isMobileOpen = !isMobileOpen"
          >
            ☰
          </button>
        </div>
      </header>
      <AdminSecondaryNav />
      <main class="admin-main"><slot /></main>
    </div>
  </div>
</template>

<style src="~/assets/css/admin.css"></style>
