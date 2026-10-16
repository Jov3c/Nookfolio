<script setup lang="ts">
import { Toaster } from 'vue-sonner';
import 'vue-sonner/style.css';
import SiteBrand from '~/components/shell/SiteBrand.vue';
import ThemeToggle from '~/components/shell/ThemeToggle.vue';

const admin = useAdminSession();
const route = useRoute();
const isSigningOut = ref(false);
const isMobileOpen = ref(false);
const mobileMenuButton = ref<HTMLButtonElement | null>(null);
const mobileCloseButton = ref<HTMLButtonElement | null>(null);
const navigationElement = ref<HTMLElement | null>(null);
const expandedGroups = ref(getDefaultExpandedAdminGroups());
const indicatorStyle = reactive({
  opacity: '0',
  width: '0px',
  height: '0px',
  transform: 'translate3d(0, 0, 0)',
});
let navigationResizeObserver: ResizeObserver | null = null;

const navigation = [
  {
    label: '内容管理',
    items: [
      { label: '文章管理', text: '文章', to: '/admin/posts' },
      { label: '分类管理', text: '分类', to: '/admin/categories' },
      { label: '项目管理', text: '项目', to: '/admin/projects' },
      { label: '时间线', to: '/admin/timeline' },
    ],
  },
  {
    label: '资料管理',
    items: [
      { label: '首页资料', text: '首页', to: '/admin/home' },
      { label: '个人简历', text: '个人简历', to: '/admin/cv' },
      { label: 'About 页面', text: 'About 页面', to: '/admin/about' },
    ],
  },
  {
    label: '互动管理',
    items: [
      { label: '评论管理', text: '评论', to: '/admin/comments' },
      { label: '留言管理', text: '留言', to: '/admin/messages' },
      { label: '友链管理', text: '友链', to: '/admin/links' },
    ],
  },
  {
    label: '系统管理',
    items: [{ label: '媒体库', text: '媒体库', to: '/admin/media' }],
  },
];

const currentPage = computed(() => {
  if (route.path === '/admin') return '仪表盘';
  return (
    navigation.flatMap((section) => section.items).find((item) => route.path.startsWith(item.to))
      ?.label ?? '后台管理'
  );
});

const isIndicatorAllowed = computed(() => {
  if (route.path === '/admin') return true;
  const activeGroup = navigation.find((section) =>
    section.items.some((item) => isRouteActive(item.to)),
  );
  return !activeGroup || expandedGroups.value.has(activeGroup.label);
});

function isRouteActive(to: string) {
  return route.path === to || (to !== '/admin' && route.path.startsWith(`${to}/`));
}

function isGroupExpanded(label: string) {
  return expandedGroups.value.has(label);
}

async function toggleGroup(label: string) {
  const next = new Set(expandedGroups.value);
  if (next.has(label)) {
    next.delete(label);
    const activeGroup = navigation.find(
      (section) => section.label === label && section.items.some((item) => isRouteActive(item.to)),
    );
    if (activeGroup) indicatorStyle.opacity = '0';
  } else next.add(label);
  expandedGroups.value = next;
  await nextTick();
  requestAnimationFrame(updateIndicator);
}

function updateIndicator() {
  const navigationRoot = navigationElement.value;
  const active = navigationRoot?.querySelector<HTMLElement>('[data-active="true"]');
  const activeGroup = active?.closest<HTMLElement>('.admin-nav-group');
  if (
    !navigationRoot ||
    !active ||
    active.getClientRects().length === 0 ||
    (activeGroup && !activeGroup.classList.contains('admin-nav-group--expanded'))
  ) {
    indicatorStyle.opacity = '0';
    return;
  }
  const geometry = getAdminNavIndicatorGeometry(
    active.getBoundingClientRect(),
    navigationRoot.getBoundingClientRect(),
  );
  indicatorStyle.width = `${geometry.width}px`;
  indicatorStyle.height = `${geometry.height}px`;
  indicatorStyle.transform = `translate3d(${geometry.x}px, ${geometry.y}px, 0)`;
  indicatorStyle.opacity = '1';
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  nextTick(() => {
    updateIndicator();
    navigationResizeObserver = new ResizeObserver(updateIndicator);
    if (navigationElement.value) navigationResizeObserver.observe(navigationElement.value);
    window.addEventListener('resize', updateIndicator);
  });
});

watch(
  () => route.path,
  async () => {
    await nextTick();
    requestAnimationFrame(updateIndicator);
  },
);

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
  window.removeEventListener('resize', updateIndicator);
  navigationResizeObserver?.disconnect();
});

async function openMobileNav() {
  isMobileOpen.value = true;
  await nextTick();
  mobileCloseButton.value?.focus();
}

function closeMobileNav(restoreFocus = true) {
  if (!isMobileOpen.value) return;
  isMobileOpen.value = false;
  if (restoreFocus) nextTick(() => mobileMenuButton.value?.focus());
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isMobileOpen.value) closeMobileNav();
}

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
</script>

<template>
  <div class="admin-root">
    <Toaster position="bottom-right" :duration="2500" close-button rich-colors />
    <div
      class="admin-layout"
      :class="{
        'admin-layout--mobile-open': isMobileOpen,
      }"
    >
      <button
        v-if="isMobileOpen"
        class="admin-sidebar-backdrop"
        type="button"
        aria-label="关闭导航"
        @click="closeMobileNav()"
      />
      <aside id="admin-sidebar" class="admin-sidebar">
        <div class="admin-sidebar__brand-row">
          <SiteBrand
            class="admin-wordmark"
            to="/admin"
            aria-label="返回概览仪表盘"
            @click="closeMobileNav(false)"
          />
          <button
            ref="mobileCloseButton"
            class="admin-sidebar__mobile-close"
            type="button"
            aria-label="关闭导航"
            @click="closeMobileNav()"
          >
            ×
          </button>
        </div>

        <nav ref="navigationElement" aria-label="后台导航">
          <span
            class="admin-nav-indicator"
            :class="{ 'admin-nav-indicator--hidden': !isIndicatorAllowed }"
            :style="indicatorStyle"
            aria-hidden="true"
          />
          <NuxtLink
            class="admin-nav-link"
            to="/admin"
            aria-label="仪表盘"
            :data-active="isRouteActive('/admin')"
            @click="closeMobileNav(false)"
            ><span>概览</span></NuxtLink
          >
          <section
            v-for="section in navigation"
            :key="section.label"
            class="admin-nav-group"
            :class="{ 'admin-nav-group--expanded': isGroupExpanded(section.label) }"
          >
            <button
              class="admin-nav-group__trigger"
              type="button"
              :aria-expanded="isGroupExpanded(section.label)"
              :aria-controls="`admin-nav-${section.label}`"
              @click="toggleGroup(section.label)"
            >
              <span>{{ section.label }}</span>
              <span class="admin-nav-group__chevron" aria-hidden="true">⌄</span>
            </button>
            <div :id="`admin-nav-${section.label}`" class="admin-nav-group__collapse">
              <div class="admin-nav-group__items">
                <NuxtLink
                  v-for="(item, index) in section.items"
                  :key="item.to"
                  class="admin-nav-link"
                  :style="{ '--admin-nav-item-index': index }"
                  :to="item.to"
                  :aria-label="item.label"
                  :data-active="isRouteActive(item.to)"
                  @click="closeMobileNav(false)"
                >
                  <span>{{ item.text ?? item.label }}</span>
                </NuxtLink>
              </div>
            </div>
          </section>
        </nav>

        <div class="admin-identity">
          <span>{{ admin?.displayName.slice(0, 2).toUpperCase() }}</span>
          <div>
            <strong>{{ admin?.displayName }}</strong>
            <small>{{ admin?.email }}</small>
          </div>
        </div>
      </aside>

      <div class="admin-workspace">
        <header class="admin-topbar">
          <div class="admin-topbar__leading">
            <button
              ref="mobileMenuButton"
              class="admin-mobile-menu"
              type="button"
              aria-label="打开导航"
              aria-controls="admin-sidebar"
              :aria-expanded="isMobileOpen"
              @click="openMobileNav"
            >
              ☰
            </button>
            <strong class="admin-current-page">{{ currentPage }}</strong>
          </div>
          <div class="admin-topbar__actions">
            <ThemeToggle />
            <NuxtLink to="/" target="_blank">查看站点 ↗</NuxtLink>
            <button type="button" :disabled="isSigningOut" @click="signOut">
              {{ isSigningOut ? '正在退出…' : '退出登录' }}
            </button>
          </div>
        </header>
        <main class="admin-main"><slot /></main>
      </div>
    </div>
  </div>
</template>

<style src="~/assets/css/admin.css"></style>
