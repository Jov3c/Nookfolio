<script setup lang="ts">
import ArticleTableOfContents from '~/components/blog/ArticleTableOfContents.vue';
import type { ProjectDetailResponse } from '~/types/project';

const route = useRoute();
definePageMeta({ layout: 'blog-prototype' });
const slug = String(route.params.slug);
const { data, error } = await useFetch<ProjectDetailResponse>(
  () => `/api/v1/public/projects/${encodeURIComponent(slug)}`,
  { key: `public-project-${slug}` },
);

if (error.value) {
  throw createError({
    statusCode: error.value.statusCode === 404 ? 404 : 503,
    statusMessage: error.value.statusMessage || '未找到项目',
  });
}

const project = data.value?.data;

if (!project) {
  throw createError({ statusCode: 404, statusMessage: '未找到项目' });
}

const readmeRoot = ref<HTMLElement | null>(null);
const readmeBody = ref<HTMLElement | null>(null);
const hasTableOfContents = ref(false);

usePageSeo({
  title: `${project.name} — 项目 — Nookfolio`,
  description: project.summary,
});
</script>

<template>
  <div class="page-container project-readme-page">
    <NuxtLink class="back-link" to="/projects">← 返回项目</NuxtLink>
    <div
      class="article-reading-layout project-readme-layout"
      :class="{ 'article-reading-layout--with-toc': hasTableOfContents }"
    >
      <ArticleTableOfContents
        :article-root="readmeRoot"
        :content-root="readmeBody"
        @headings-change="hasTableOfContents = $event"
      />
      <section ref="readmeRoot" class="project-readme-shell">
        <div class="project-readme-head">README.md</div>
        <article class="project-prototype-readme">
          <!-- The API returns HTML after the shared server-side Markdown sanitizer. -->
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div ref="readmeBody" class="readme__content" v-html="project.readmeHtml" />
        </article>
      </section>
    </div>
  </div>
</template>

<style src="~/assets/css/public.css"></style>
