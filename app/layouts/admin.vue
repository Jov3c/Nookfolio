<script setup lang="ts">
import { Toaster } from 'vue-sonner';
import 'vue-sonner/style.css';
import SiteBrand from '~/components/shell/SiteBrand.vue';
import ThemeToggle from '~/components/shell/ThemeToggle.vue';

const admin = useAdminSession();
const isSigningOut = ref(false);
const isMobileOpen = ref(false);
const primaryNav = ref<{ focusFirst: () => void } | null>(null);
const mobileMenuButton = ref<HTMLButtonElement | null>(null);

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

async function toggleMobileNavigation() {
  isMobileOpen.value = !isMobileOpen.value;
  if (isMobileOpen.value) {
    await nextTick();
    primaryNav.value?.focusFirst();
  }
}

async function closeMobileNavigation({ restoreFocus = false } = {}) {
  if (!isMobileOpen.value) return;
  isMobileOpen.value = false;
  if (restoreFocus) {
    await nextTick();
    mobileMenuButton.value?.focus();
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') void closeMobileNavigation({ restoreFocus: true });
}
onMounted(() => window.addEventListener('keydown', handleKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown));
</script>

<template>
  <div class="admin-root">
    <Toaster position="bottom-right" :duration="2500" close-button rich-colors />
    <div class="admin-layout">
      <header class="admin-topbar">
        <SiteBrand to="/admin" aria-label="返回概览仪表盘" />
        <AdminPrimaryNav
          ref="primaryNav"
          :class="{ 'admin-primary-nav--open': isMobileOpen }"
          @click="closeMobileNavigation()"
        />
        <div class="admin-topbar__actions">
          <NuxtLink class="admin-view-site" to="/" target="_blank">查看站点</NuxtLink>
          <ThemeToggle />
          <details class="admin-identity-menu">
            <summary class="admin-identity-button" :title="admin?.email">
              {{ admin?.displayName.slice(0, 2).toUpperCase() }}
            </summary>
            <div class="admin-identity-menu__panel">
              <strong>{{ admin?.displayName }}</strong>
              <span>{{ admin?.email }}</span>
              <button type="button" :disabled="isSigningOut" @click="signOut">
                {{ isSigningOut ? '正在退出…' : '退出登录' }}
              </button>
            </div>
          </details>
          <button
            ref="mobileMenuButton"
            class="admin-mobile-menu"
            type="button"
            :aria-label="isMobileOpen ? '关闭导航' : '打开导航'"
            aria-controls="admin-primary-navigation"
            :aria-expanded="isMobileOpen"
            @click="toggleMobileNavigation"
          >
            ☰
          </button>
        </div>
      </header>
      <div class="admin-workspace">
        <aside class="admin-workspace__index">
          <AdminSecondaryNav />
        </aside>
        <main class="admin-main admin-workspace__content"><slot /></main>
      </div>
    </div>
  </div>
</template>

<style src="~/assets/css/admin.css"></style>
