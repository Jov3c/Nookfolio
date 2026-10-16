<script setup lang="ts">
definePageMeta({ layout: 'blog-prototype' });

const feedPath = '/rss.xml';
const requestUrl = useRequestURL();
const feedUrl = computed(() => new URL(feedPath, requestUrl.origin).toString());
const copyState = ref<'idle' | 'copied' | 'failed'>('idle');
let resetTimer: ReturnType<typeof setTimeout> | undefined;

usePageSeo(() => ({
  title: 'RSS 订阅',
  description: '通过 RSS 阅读器订阅网站更新，不错过新文章。',
}));

async function copyFeedUrl() {
  if (!import.meta.client || !navigator.clipboard) {
    copyState.value = 'failed';
    return;
  }
  try {
    await navigator.clipboard.writeText(feedUrl.value);
    copyState.value = 'copied';
  } catch {
    copyState.value = 'failed';
  }
  clearTimeout(resetTimer);
  resetTimer = setTimeout(() => (copyState.value = 'idle'), 2500);
}

onBeforeUnmount(() => clearTimeout(resetTimer));
</script>

<template>
  <div class="page-container rss-guide-page">
    <section class="rss-guide">
      <p class="eyebrow">FOLLOW THE SIGNAL</p>
      <h1>RSS 订阅</h1>
      <p class="rss-guide__lead">
        把更新交给阅读器。复制下面的地址，添加到你常用的 RSS 阅读器，新文章发布后就能在那里看到。
      </p>

      <div class="rss-guide__feed">
        <code>{{ feedUrl }}</code>
        <button type="button" @click="copyFeedUrl">
          {{ copyState === 'copied' ? '已复制' : '复制订阅地址' }}
        </button>
      </div>
      <p v-if="copyState === 'failed'" class="rss-guide__status" role="status">
        浏览器未允许自动复制，请手动选择上面的地址。
      </p>

      <div class="rss-guide__actions">
        <a :href="feedPath" target="_blank" rel="alternate">查看原始订阅源</a>
        <NuxtLink to="/blog">返回博客</NuxtLink>
      </div>

      <aside>
        <strong>什么是 RSS？</strong>
        <p>RSS 是一种不依赖算法推荐的订阅方式。你决定关注什么，阅读器按发布时间呈现更新。</p>
      </aside>
    </section>
  </div>
</template>

<style src="~/assets/css/rss.css"></style>
