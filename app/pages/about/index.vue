<script setup lang="ts">
import type { AboutProfileResponse } from '~/types/about';

definePageMeta({ layout: 'blog-prototype' });

const { data: aboutResponse, error } = await useFetch<AboutProfileResponse>(
  '/api/v1/public/about',
  { key: 'public-about' },
);

if (!aboutResponse.value) {
  throw createError({
    statusCode: error.value?.statusCode || 503,
    statusMessage: '关于页面暂时无法访问',
  });
}

const about = computed(() => aboutResponse.value!.data);

usePageSeo(() => ({
  title: `关于 — ${about.value.title}`,
  description: about.value.introduction,
}));
</script>

<template>
  <div class="page-container about-editorial-page">
    <div class="about-editorial">
      <header class="about-editorial__hero">
        <p class="eyebrow">{{ about.eyebrow }}</p>
        <h1>{{ about.title }}</h1>
        <p class="about-editorial__dek">{{ about.introduction }}</p>
      </header>

      <article class="about-editorial__story">
        <aside>
          <span>01</span>
          <p>{{ about.personalTitle }}</p>
        </aside>
        <div>
          <p class="dropcap about-editorial__long-copy">{{ about.personalBody }}</p>
        </div>
      </article>

      <blockquote class="about-editorial__quote">“{{ about.quote }}”</blockquote>

      <article class="about-editorial__story about-editorial__story--site">
        <aside>
          <span>02</span>
          <p>{{ about.siteTitle }}</p>
        </aside>
        <div>
          <h2>{{ about.siteTitle }}</h2>
          <p class="about-editorial__long-copy">{{ about.siteBody }}</p>
          <ul>
            <li v-for="fact in about.siteFacts" :key="`${fact.label}-${fact.value}`">
              <span>{{ fact.label }}</span
              >{{ fact.value }}
            </li>
          </ul>
        </div>
      </article>
    </div>
  </div>
</template>

<style src="~/assets/css/about.css"></style>
