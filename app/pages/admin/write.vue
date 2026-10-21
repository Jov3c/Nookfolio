<script setup lang="ts">
import type { AdminPost, BlogCategory } from '~/types/blog';
import {
  createAutomaticPostSlug,
  createDraftPayload,
  validatePostForPublish,
  type PostEditorFormValue,
} from '~/utils/post-editor';

definePageMeta({ layout: 'admin', middleware: 'admin' });

const route = useRoute();
const categories = ref<BlogCategory[]>([]);
const coverUrl = ref('');
const draftId = ref('');
const fallbackSlug = ref(createFallbackSlug());
const isLoading = ref(true);
const isPublishing = ref(false);
const saveState = ref<'idle' | 'saving' | 'saved' | 'error'>('idle');
const notice = ref('');
const errorMessage = ref('');
const hydrated = ref(false);
const dirty = ref(false);
const form = reactive<PostEditorFormValue>(createEmptyForm());
let saveTimer: number | undefined;

const saveStateLabel = computed(() => {
  if (saveState.value === 'saving') return '正在自动保存…';
  if (saveState.value === 'saved') return '草稿已自动保存';
  if (saveState.value === 'error') return '自动保存失败';
  return draftId.value ? '草稿已载入' : '输入内容后自动保存草稿';
});

useSeoMeta({ title: '发布文章 — Nookfolio 管理后台', robots: 'noindex, nofollow' });

async function load() {
  try {
    const categoryResult = await $fetch<{ data: BlogCategory[] }>('/api/v1/admin/categories');
    categories.value = categoryResult.data;
    form.categoryId = categories.value[0]?.id ?? '';

    const requestedDraft = typeof route.query.draft === 'string' ? route.query.draft : '';
    if (requestedDraft) {
      const result = await $fetch<{ data: AdminPost[] }>('/api/v1/admin/posts', {
        query: { status: 'DRAFT', page: 1, pageSize: 100 },
      });
      const draft = result.data.find((post) => post.id === requestedDraft);
      if (!draft) throw new Error('DRAFT_NOT_FOUND');
      draftId.value = draft.id;
      fallbackSlug.value = draft.slug;
      Object.assign(form, {
        title: draft.title === '未命名文章' ? '' : draft.title,
        slug: draft.slug.startsWith('draft-') ? '' : draft.slug,
        excerpt: draft.excerpt === '尚未填写摘要' ? '' : draft.excerpt,
        categoryId: draft.category.id,
        coverMediaId: draft.cover?.id ?? '',
        markdownBody: draft.markdownBody,
        seoTitle: draft.seoTitle ?? '',
        seoDescription: draft.seoDescription ?? '',
      });
      coverUrl.value = draft.cover?.publicUrl ?? '';
    }
  } catch (error) {
    errorMessage.value =
      error instanceof Error && error.message === 'DRAFT_NOT_FOUND'
        ? '找不到这篇草稿，它可能已经发布或删除。'
        : '文章编辑器加载失败，请刷新重试。';
  } finally {
    isLoading.value = false;
    await nextTick();
    hydrated.value = true;
  }
}

watch(
  form,
  () => {
    if (!hydrated.value || isPublishing.value) return;
    dirty.value = true;
    saveState.value = 'idle';
    errorMessage.value = '';
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => void autoSaveDraft(), 1000);
  },
  { deep: true },
);

async function persistDraft() {
  if (!form.categoryId) throw new Error('NO_CATEGORY');
  if (!draftId.value) {
    fallbackSlug.value = createAutomaticPostSlug(form.title, fallbackSlug.value);
  }
  const body = createDraftPayload(form, fallbackSlug.value);
  const result = draftId.value
    ? await $fetch<{ data: AdminPost }>(`/api/v1/admin/posts/${draftId.value}`, {
        method: 'PATCH',
        body,
      })
    : await $fetch<{ data: AdminPost }>('/api/v1/admin/posts', { method: 'POST', body });
  draftId.value = result.data.id;
  fallbackSlug.value = result.data.slug;
  dirty.value = false;
  if (route.query.draft !== result.data.id) {
    await navigateTo({ path: '/admin/write', query: { draft: result.data.id } }, { replace: true });
  }
  return result.data;
}

async function autoSaveDraft() {
  if (!dirty.value || isPublishing.value) return;
  saveState.value = 'saving';
  try {
    await persistDraft();
    saveState.value = 'saved';
  } catch (error) {
    saveState.value = 'error';
    errorMessage.value = articleErrorMessage(error, '草稿自动保存失败，请点击重试。');
  }
}

async function retrySave() {
  dirty.value = true;
  await autoSaveDraft();
}

async function publishPost() {
  const validationErrors = validatePostForPublish(form, { automaticSlug: true });
  if (validationErrors.length) {
    errorMessage.value = validationErrors.join('；');
    return;
  }
  window.clearTimeout(saveTimer);
  isPublishing.value = true;
  notice.value = '';
  errorMessage.value = '';
  try {
    await persistDraft();
    await $fetch(`/api/v1/admin/posts/${draftId.value}/publish`, { method: 'PATCH' });
    notice.value = '文章发布成功，正在进入文章管理。';
    await navigateTo('/admin/posts');
  } catch (error) {
    errorMessage.value = articleErrorMessage(error, '文章发布失败，请检查内容后重试。');
  } finally {
    isPublishing.value = false;
  }
}

function articleErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message === 'NO_CATEGORY') return '请先创建并选择文章分类。';
  const fetchError = error as { data?: { error?: { code?: string; message?: string } } };
  if (fetchError.data?.error?.code === 'POST_SLUG_CONFLICT')
    return '路径标识已被使用，请更换后重试。';
  return fetchError.data?.error?.message || fallback;
}

function createEmptyForm(): PostEditorFormValue {
  return {
    title: '',
    slug: '',
    excerpt: '',
    categoryId: '',
    coverMediaId: '',
    markdownBody: '',
    seoTitle: '',
    seoDescription: '',
  };
}

function createFallbackSlug() {
  const today = new Date();
  const date = [today.getFullYear(), today.getMonth() + 1, today.getDate()]
    .map((part, index) => String(part).padStart(index === 0 ? 4 : 2, '0'))
    .join('');
  return `post-${date}-${Math.random().toString(36).slice(2, 6)}`;
}

onBeforeRouteLeave(async () => {
  window.clearTimeout(saveTimer);
  if (dirty.value && !isPublishing.value) await autoSaveDraft();
});
onBeforeUnmount(() => window.clearTimeout(saveTimer));
onMounted(load);
</script>

<template>
  <div class="posts-admin">
    <header class="admin-page-heading">
      <div>
        <p>内容管理 / 发布文章</p>
        <h1>发布文章</h1>
      </div>
      <div class="admin-heading-actions">
        <NuxtLink class="admin-secondary-button" to="/admin/write/drafts">草稿箱</NuxtLink>
        <NuxtLink class="admin-secondary-button" to="/admin/posts">文章管理</NuxtLink>
      </div>
    </header>

    <p v-if="isLoading" class="media-empty">正在打开编辑器…</p>
    <form v-else class="home-admin-section post-editor" novalidate @submit.prevent="publishPost">
      <AdminNotice :message="notice" />
      <p v-if="errorMessage" class="admin-error" role="alert">{{ errorMessage }}</p>
      <div class="home-admin-section__heading">
        <div>
          <p class="eyebrow">写作空间</p>
          <h2>{{ form.title || '记录一个清晰的想法' }}</h2>
        </div>
        <div class="post-autosave-status" :data-state="saveState">
          <span>{{ saveStateLabel }}</span>
          <button v-if="saveState === 'error'" type="button" @click="retrySave">重试</button>
        </div>
      </div>

      <AdminPostEditorFields
        v-model="form"
        :categories="categories"
        :cover-url="coverUrl"
        :show-slug="false"
        @cover-uploaded="coverUrl = $event.publicUrl"
        @cover-removed="coverUrl = ''"
        @upload-error="errorMessage = $event"
        @imported="notice = `已导入 ${$event}，正在自动保存。`"
        @import-error="errorMessage = $event"
      />

      <div class="project-editor__actions post-editor__actions">
        <button class="button" type="submit" :disabled="isPublishing || !categories.length">
          {{ isPublishing ? '正在发布…' : '发布文章' }}
        </button>
        <span class="muted">未发布内容会自动保存在草稿箱。</span>
      </div>
    </form>
  </div>
</template>
