<script setup lang="ts">
import BlogChrome from '~/components/blog/BlogChrome.vue';
import CategoryFilter from '~/components/blog/CategoryFilter.vue';
import PostCard from '~/components/blog/PostCard.vue';
import ErrorState from '~/components/ui/ErrorState.vue';
import SkeletonBlock from '~/components/ui/SkeletonBlock.vue';
import StandardHero from '~/components/ui/StandardHero.vue';
import type { PublicCategoriesResponse, PublicPost, PublicPostsResponse } from '~/types/blog';
import { appendUniquePosts } from '~/utils/blog-reading';

definePageMeta({ layout: 'blog-prototype' });

const route = useRoute();
const selectedCategory = computed(() =>
  typeof route.query.category === 'string' ? route.query.category : '',
);
const categoryQuery = computed(() => ({ page: 1, pageSize: 5, category: selectedCategory.value }));
const [{ data: postsResponse, pending, error, refresh }, { data: categoriesResponse }] =
  await Promise.all([
    useFetch<PublicPostsResponse>('/api/v1/public/posts', { query: categoryQuery }),
    useFetch<PublicCategoriesResponse>('/api/v1/public/categories', {
      key: 'public-blog-categories',
    }),
  ]);
const showPrototypeSkeleton = ref(true);
const posts = ref<PublicPost[]>([]);
const currentPage = ref(1);
const loadingMore = ref(false);
const loadMoreError = ref(false);
const loadMoreSentinel = ref<HTMLElement | null>(null);
const total = computed(() => postsResponse.value?.meta.total ?? 0);
const hasMore = computed(() => posts.value.length < total.value);

let skeletonTimer: number | undefined;
let loadMoreObserver: IntersectionObserver | undefined;

watch(loadMoreSentinel, (sentinel, previous) => {
  if (previous) loadMoreObserver?.unobserve(previous);
  if (sentinel) loadMoreObserver?.observe(sentinel);
});

watch(
  postsResponse,
  (response) => {
    posts.value = response?.data.items ?? [];
    currentPage.value = 1;
    loadMoreError.value = false;
  },
  { immediate: true },
);

async function loadMore() {
  if (!hasMore.value || loadingMore.value) return;
  loadingMore.value = true;
  loadMoreError.value = false;
  const category = selectedCategory.value;
  const nextPage = currentPage.value + 1;
  try {
    const response = await $fetch<PublicPostsResponse>('/api/v1/public/posts', {
      query: { page: nextPage, pageSize: 5, category },
    });
    if (category !== selectedCategory.value) return;
    posts.value = appendUniquePosts(posts.value, response.data.items);
    currentPage.value = nextPage;
  } catch {
    loadMoreError.value = true;
  } finally {
    loadingMore.value = false;
  }
}

onMounted(() => {
  skeletonTimer = window.setTimeout(() => (showPrototypeSkeleton.value = false), 900);
  loadMoreObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) void loadMore();
    },
    { rootMargin: '360px 0px' },
  );
  if (loadMoreSentinel.value) loadMoreObserver.observe(loadMoreSentinel.value);
});
onBeforeUnmount(() => {
  window.clearTimeout(skeletonTimer);
  loadMoreObserver?.disconnect();
});

function coverVariant(slug: string) {
  const prototypeOrder = ['server', 'ai', 'product', 'wechat', 'signal'];
  const prototypeIndex = prototypeOrder.indexOf(slug);
  if (prototypeIndex >= 0) return prototypeIndex + 1;

  const hash = [...slug].reduce((total, character) => total + character.charCodeAt(0), 0);
  return (hash % 5) + 1;
}

usePageSeo({
  title: 'Blog — Nookfolio',
  description: '记录 AI、产品、开发和一些值得长期保留的想法。',
});
</script>

<template>
  <BlogChrome>
    <template #category>
      <CategoryFilter :categories="categoriesResponse?.data ?? []" />
    </template>
    <template #hero>
      <StandardHero eyebrow="WRITING" title="Blog" description="记录想法和生活" />
    </template>
    <div
      v-if="showPrototypeSkeleton || pending"
      class="post-list post-list--loading"
      aria-label="正在加载文章"
    >
      <div v-for="index in 5" :key="index" class="post-card post-card--skeleton">
        <SkeletonBlock class="post-card__skeleton-cover" />
        <div class="post-card__skeleton-body">
          <SkeletonBlock class="post-card__skeleton-meta" />
          <SkeletonBlock class="post-card__skeleton-title" />
          <SkeletonBlock class="post-card__skeleton-line" />
          <SkeletonBlock class="post-card__skeleton-line post-card__skeleton-line--short" />
        </div>
      </div>
    </div>
    <ErrorState v-else-if="error" title="文章暂时无法加载" description="请稍后再试。">
      <button class="button button--ghost" type="button" @click="refresh()">重新加载</button>
    </ErrorState>
    <div v-else-if="posts.length === 0" class="state-panel">
      <h2>这个分类还没有文章。</h2>
      <p>换一个分类，或者回到全部文章。</p>
    </div>
    <div v-else class="post-list">
      <PostCard
        v-for="(post, index) in posts"
        :key="post.slug"
        :post="post"
        :featured="index === 0"
        :cover-variant="coverVariant(post.slug)"
      />
      <div ref="loadMoreSentinel" class="post-list__sentinel" aria-live="polite">
        <span v-if="loadingMore">正在加载更多文章…</span>
        <button v-else-if="loadMoreError" type="button" @click="loadMore">
          加载失败，点击重试
        </button>
        <span v-else-if="!hasMore && posts.length">已经看到全部文章</span>
      </div>
    </div>
  </BlogChrome>
</template>
