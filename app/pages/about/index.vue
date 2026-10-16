<script setup lang="ts">
import type { PublicCvResponse } from '~/types/cv';
import type { PublicHomeResponse } from '~/types/home';
import type { PublicSiteStatsResponse } from '~/types/stats';

definePageMeta({ layout: 'blog-prototype' });

const { data: homeResponse, error: homeError } = await useFetch<PublicHomeResponse>(
  '/api/v1/public/home',
  { key: 'about-home' },
);
const { data: statsResponse } = await useFetch<PublicSiteStatsResponse>(
  '/api/v1/public/site/stats',
  { key: 'about-site-stats', ignoreResponseError: true },
);
const { data: cvResponse } = await useFetch<PublicCvResponse>('/api/v1/public/cv', {
  key: 'about-public-cv',
  ignoreResponseError: true,
});

if (!homeResponse.value) {
  throw createError({
    statusCode: homeError.value?.statusCode || 503,
    statusMessage: '关于页面暂时无法访问',
  });
}

const home = computed(() => homeResponse.value!.data);
const stats = computed(() => statsResponse.value?.data);
const cv = computed(() => cvResponse.value?.data ?? null);
const name = computed(() => cv.value?.profile.name || home.value.homeProfile.nickname);
const role = computed(() => cv.value?.profile.headline || home.value.homeProfile.role);
const biography = computed(() => cv.value?.profile.bio || home.value.homeProfile.intro);
const statement = computed(
  () =>
    cv.value?.profile.statement ||
    home.value.homeProfile.statusText ||
    '保持好奇，认真完成，并把值得留下的东西保存下来。',
);

function formatNumber(value: number | undefined) {
  return value === undefined ? '—' : new Intl.NumberFormat('zh-CN').format(value);
}

usePageSeo(() => ({
  title: `关于 — ${name.value}`,
  description: `${name.value} 的个人介绍，以及关于 ${home.value.siteProfile.siteTitle} 的详细信息。`,
}));
</script>

<template>
  <div class="page-container about-editorial-page">
    <div class="about-editorial">
      <header class="about-editorial__hero">
        <p class="eyebrow">A PERSONAL NOTE</p>
        <h1>在网络上，<em>留一间自己的房间。</em></h1>
        <p class="about-editorial__dek">我是 {{ name }}。{{ role }}。</p>
      </header>

      <article class="about-editorial__story">
        <aside>
          <span>01</span>
          <p>关于我</p>
        </aside>
        <div>
          <p class="dropcap">{{ biography }}</p>
          <p>
            我把博客当作思考的存档，把项目当作实践的记录，也把这个网站当作一处可以持续整理和更新的个人空间。
          </p>
        </div>
      </article>

      <blockquote class="about-editorial__quote">“{{ statement }}”</blockquote>

      <article class="about-editorial__story about-editorial__story--site">
        <aside>
          <span>02</span>
          <p>关于网站</p>
        </aside>
        <div>
          <h2>{{ home.siteProfile.siteTitle }} 是作品集，也是一本持续生长的笔记。</h2>
          <p>{{ home.siteProfile.siteDescription }}</p>
          <ul>
            <li><span>Since</span>{{ home.siteProfile.foundedAt.slice(0, 4) }}</li>
            <li><span>Articles</span>{{ formatNumber(stats?.totalPosts) }}</li>
            <li><span>Page views</span>{{ formatNumber(stats?.totalPageViews) }}</li>
          </ul>
        </div>
      </article>
    </div>
  </div>
</template>

<style src="~/assets/css/about.css"></style>
