<script setup lang="ts">
import BlogChrome from '~/components/blog/BlogChrome.vue';
import SkeletonBlock from '~/components/ui/SkeletonBlock.vue';
import StandardHero from '~/components/ui/StandardHero.vue';
import type { PublicFriendLinksResponse } from '~/types/friend-links';
import type { PublicHomeResponse } from '~/types/home';

const { data, pending, error } = await useFetch<PublicFriendLinksResponse>('/api/v1/public/links', {
  key: 'public-friend-links',
  query: { page: 1, pageSize: 6 },
});

const friendLinks = computed(() => data.value?.data ?? []);
const displayLinks = computed(() => friendLinks.value.slice(0, 6));
const showPrototypeSkeleton = ref(true);
const { data: homeData } = await useFetch<PublicHomeResponse>('/api/v1/public/home', {
  key: 'links-site-information',
});
const runtimeConfig = useRuntimeConfig();
const copiedField = ref('');
const siteFieldLabels: Record<string, string> = {
  name: '名称',
  url: '地址',
  feed: '订阅',
  icon: '图标',
  description: '描述',
};
const siteOrigin = computed(() =>
  String(runtimeConfig.public.siteUrl || 'https://jov3.cloud').replace(/\/$/, ''),
);
const siteInfo = computed(() => {
  const home = homeData.value?.data;
  return {
    name: home?.siteProfile.siteTitle || 'Nookfolio',
    url: siteOrigin.value,
    feed: `${siteOrigin.value}/rss.xml`,
    icon: `${siteOrigin.value}/avatar`,
    description: '保持好奇。',
  };
});

let skeletonTimer: number | undefined;
let copyTimer: number | undefined;

onMounted(() => {
  skeletonTimer = window.setTimeout(() => (showPrototypeSkeleton.value = false), 850);
});
onBeforeUnmount(() => {
  window.clearTimeout(skeletonTimer);
  window.clearTimeout(copyTimer);
});

definePageMeta({ layout: 'blog-prototype' });

usePageSeo({
  title: 'Links — Blog — Nookfolio',
  description: '一些我会经常拜访的小站。互联网很大，能留下彼此的入口是一件很有意思的事。',
});

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function domain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function avatarClass(index: number) {
  return `avatar-${String.fromCharCode(97 + (index % 6))}`;
}

function absoluteUrl(value: string) {
  try {
    return new URL(value, `${siteOrigin.value}/`).toString();
  } catch {
    return value;
  }
}

async function copySiteField(field: string, value: string) {
  await navigator.clipboard.writeText(value);
  copiedField.value = field;
  window.clearTimeout(copyTimer);
  copyTimer = window.setTimeout(() => {
    if (copiedField.value === field) copiedField.value = '';
  }, 1400);
}
</script>

<template>
  <BlogChrome :show-subnav="false">
    <template #hero>
      <StandardHero
        eyebrow="FRIENDS"
        title="Links"
        description="一些我会经常拜访的小站。互联网很大，能留下彼此的入口是一件很有意思的事。"
      />
    </template>

    <section class="links-card" aria-labelledby="friend-links-heading">
      <header class="links-head">
        <h2 id="friend-links-heading">朋友们的小站</h2>
        <small>{{
          showPrototypeSkeleton || pending ? 'Loading…' : `${displayLinks.length} 位朋友`
        }}</small>
      </header>

      <div v-if="showPrototypeSkeleton || pending" class="link-grid" aria-label="正在加载友链">
        <div v-for="index in 6" :key="index" class="link-card link-card--skeleton">
          <SkeletonBlock class="link-card__skeleton-avatar" />
          <div class="link-card__skeleton-text">
            <SkeletonBlock class="link-card__skeleton-name" />
            <SkeletonBlock class="link-card__skeleton-description" />
          </div>
        </div>
      </div>
      <p v-else-if="error" class="community-empty" role="alert">友链暂时无法加载，请稍后重试。</p>
      <p v-else-if="displayLinks.length === 0" class="community-empty">还没有公开的友链。</p>
      <div v-else class="link-grid">
        <a
          v-for="(friend, index) in displayLinks"
          :key="friend.id"
          class="link-card"
          :href="friend.url"
          target="_blank"
          rel="noreferrer"
        >
          <span class="link-avatar" :class="avatarClass(index)">
            <img
              v-if="friend.logo"
              :src="friend.logo.publicUrl"
              :alt="friend.logo.altText || `${friend.name} logo`"
              loading="lazy"
            />
            <span v-else>{{ initials(friend.name) }}</span>
          </span>
          <span class="link-body">
            <span class="link-name">{{ friend.name }}</span>
            <span class="link-desc">{{ friend.description }}</span>
            <span class="link-domain">{{ domain(friend.url) }}</span>
          </span>
        </a>
      </div>
    </section>

    <section class="site-link-info" aria-labelledby="site-link-info-heading">
      <p>若能得您垂青，还望链接小站：</p>
      <div class="site-link-card">
        <Transition name="site-link-card-toast">
          <p v-if="copiedField" class="site-link-card__toast" role="status">
            已复制{{ siteFieldLabels[copiedField] }}
          </p>
        </Transition>
        <header class="site-link-card__header">
          <img
            :src="absoluteUrl(homeData?.data.homeProfile.avatar?.url || '/favicon.ico')"
            alt="Nookfolio 头像"
          />
          <div>
            <h2 id="site-link-info-heading">Nookfolio 站点信息</h2>
            <p>点击任意一行即可复制</p>
          </div>
        </header>
        <div class="site-link-card__code">
          <button
            v-for="(value, field) in siteInfo"
            :key="field"
            type="button"
            class="site-link-card__row"
            :class="{ 'is-copied': copiedField === field }"
            :aria-label="`复制${value}`"
            @click="copySiteField(field, value)"
          >
            <span class="site-link-card__label"> {{ siteFieldLabels[field] }}： </span>
            <code>{{ value }}</code>
          </button>
        </div>
      </div>
    </section>
  </BlogChrome>
</template>
