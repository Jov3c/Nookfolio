<script setup lang="ts">
import type { PublicPost } from '~/types/blog';
import { formatPostDateTime } from '~/utils/content';

const props = defineProps<{ post: PublicPost; featured?: boolean; coverVariant?: number }>();

async function openPost(event: MouseEvent) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    return;
  event.preventDefault();
  const target = `/blog/${props.post.slug}`;
  const startViewTransition = document.startViewTransition?.bind(document);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!startViewTransition || reduceMotion) {
    await navigateTo(target);
    return;
  }

  document.documentElement.dataset.blogTransition = 'active';
  startViewTransition(async () => {
    await navigateTo(target);
    await nextTick();
  }).finished.finally(() => {
    delete document.documentElement.dataset.blogTransition;
  });
}
</script>

<template>
  <NuxtLink
    class="post-card"
    :class="{ 'post-card--featured': featured }"
    :to="`/blog/${post.slug}`"
    @click="openPost"
  >
    <div class="post-card__cover">
      <div
        class="post-card__cover-art"
        :data-cover="post.category.slug"
        :data-cover-index="coverVariant"
        :style="post.cover ? { backgroundImage: `url(${post.cover.publicUrl})` } : undefined"
      />
    </div>
    <div class="post-card__content">
      <p class="post-meta">
        <span class="post-meta__category">▱ {{ post.category.name }}</span>
        <span>◷ {{ formatPostDateTime(post.publishedAt ?? '') }}</span>
      </p>
      <h2>{{ post.title }}</h2>
      <p>{{ post.excerpt }}</p>
      <div class="post-stats">
        <span>◉ {{ post.viewCount }}</span
        ><span>▢ {{ post.commentCount }}</span
        ><span>▤ {{ post.wordCount }} 字</span>
      </div>
    </div>
  </NuxtLink>
</template>
