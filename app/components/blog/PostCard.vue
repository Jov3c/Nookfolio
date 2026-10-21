<script setup lang="ts">
import type { PublicPost } from '~/types/blog';
import { formatPostDateTime } from '~/utils/content';
import { createDefaultPostCoverLabel } from '~/utils/post-cover';

const props = defineProps<{ post: PublicPost; featured?: boolean; coverVariant?: number }>();
const transitionActive = ref(false);
const defaultCoverLabel = computed(() => createDefaultPostCoverLabel(props.post.category.name));
const defaultCoverNumber = computed(() => String(props.coverVariant || 1).padStart(2, '0'));
const defaultCoverYear = computed(() =>
  props.post.publishedAt
    ? new Date(props.post.publishedAt).getFullYear()
    : new Date().getFullYear(),
);

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

  transitionActive.value = true;
  document.documentElement.dataset.blogTransition = 'active';
  await nextTick();
  startViewTransition(async () => {
    await navigateTo(target);
    await nextTick();
  }).finished.finally(() => {
    transitionActive.value = false;
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
        :class="{ 'post-card__cover-art--default': !post.cover }"
        :data-cover="post.category.slug"
        :data-cover-index="coverVariant"
        :style="post.cover ? { backgroundImage: `url(${post.cover.publicUrl})` } : undefined"
      >
        <template v-if="!post.cover">
          <span class="post-card__cover-index">NOOKFOLIO / {{ post.category.name }}</span>
          <strong class="post-card__cover-label">{{ defaultCoverLabel }}</strong>
          <i class="post-card__cover-rule" aria-hidden="true" />
          <small class="post-card__cover-number">
            {{ defaultCoverNumber }} — {{ defaultCoverYear }}
          </small>
        </template>
      </div>
    </div>
    <div class="post-card__content" :class="{ 'is-transitioning': transitionActive }">
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
