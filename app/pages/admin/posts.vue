<script setup lang="ts">
import type { AdminPost, BlogCategory } from '~/types/blog';
import { validatePostForPublish, type PostEditorFormValue } from '~/utils/post-editor';

definePageMeta({ layout: 'admin', middleware: 'admin' });

const posts = ref<AdminPost[]>([]);
const categories = ref<BlogCategory[]>([]);
const coverUrl = ref('');
const selectedPostId = ref<string | null>(null);
const isLoading = ref(true);
const busyKey = ref('');
const notice = ref('');
const errorMessage = ref('');
const form = reactive<PostEditorFormValue>(createEmptyForm());

const selectedPost = computed(() => posts.value.find((post) => post.id === selectedPostId.value));

useSeoMeta({ title: '文章管理 — Nookfolio 管理后台', robots: 'noindex, nofollow' });

async function load() {
  isLoading.value = true;
  try {
    const [postResult, categoryResult] = await Promise.all([
      $fetch<{ data: AdminPost[] }>('/api/v1/admin/posts', {
        query: { status: 'PUBLISHED', page: 1, pageSize: 100 },
      }),
      $fetch<{ data: BlogCategory[] }>('/api/v1/admin/categories'),
    ]);
    posts.value = postResult.data;
    categories.value = categoryResult.data;
    if (posts.value[0]) selectPost(posts.value[0]);
  } catch {
    errorMessage.value = '已发布文章加载失败，请刷新重试。';
  } finally {
    isLoading.value = false;
  }
}

function selectPost(post: AdminPost) {
  selectedPostId.value = post.id;
  Object.assign(form, {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    categoryId: post.category.id,
    coverMediaId: post.cover?.id ?? '',
    markdownBody: post.markdownBody,
    seoTitle: post.seoTitle ?? '',
    seoDescription: post.seoDescription ?? '',
  });
  coverUrl.value = post.cover?.publicUrl ?? '';
  notice.value = '';
  errorMessage.value = '';
}

async function savePost() {
  if (!selectedPostId.value) return;
  const validationErrors = validatePostForPublish(form);
  if (validationErrors.length) {
    errorMessage.value = validationErrors.join('；');
    return;
  }
  await runAction('save', async () => {
    const result = await $fetch<{ data: AdminPost }>(
      `/api/v1/admin/posts/${selectedPostId.value}`,
      {
        method: 'PATCH',
        body: { ...formPayload(), status: 'PUBLISHED' },
      },
    );
    posts.value = posts.value.map((post) => (post.id === result.data.id ? result.data : post));
    selectPost(result.data);
    notice.value = `文章「${result.data.title}」已保存。`;
  });
}

async function deletePost() {
  const post = selectedPost.value;
  if (!post || !window.confirm(`确定删除「${post.title}」吗？`)) return;
  await runAction('delete', async () => {
    await $fetch(`/api/v1/admin/posts/${post.id}`, { method: 'DELETE' });
    posts.value = posts.value.filter((item) => item.id !== post.id);
    selectedPostId.value = null;
    Object.assign(form, createEmptyForm());
    if (posts.value[0]) selectPost(posts.value[0]);
    notice.value = '文章已删除。';
  });
}

function formPayload() {
  return {
    title: form.title.trim(),
    slug: form.slug.trim(),
    excerpt: form.excerpt.trim(),
    categoryId: form.categoryId,
    coverMediaId: form.coverMediaId || null,
    markdownBody: form.markdownBody,
    seoTitle: form.seoTitle.trim() || null,
    seoDescription: form.seoDescription.trim() || null,
  };
}

async function runAction(key: string, action: () => Promise<void>) {
  busyKey.value = key;
  notice.value = '';
  errorMessage.value = '';
  try {
    await action();
  } catch (error) {
    const fetchError = error as { data?: { error?: { message?: string } } };
    errorMessage.value = fetchError.data?.error?.message || '操作失败，请检查字段后重试。';
  } finally {
    busyKey.value = '';
  }
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

onMounted(load);
</script>

<template>
  <div class="posts-admin">
    <header class="admin-page-heading">
      <div>
        <p>内容管理 / 已发布文章</p>
        <h1>文章管理</h1>
      </div>
      <div class="admin-heading-actions">
        <NuxtLink class="admin-secondary-button" to="/admin/categories">管理分类</NuxtLink>
        <NuxtLink class="button" to="/admin/write">发布文章</NuxtLink>
      </div>
    </header>

    <p v-if="isLoading" class="media-empty">正在加载已发布文章…</p>
    <template v-else>
      <AdminNotice :message="notice" />
      <p v-if="errorMessage" class="admin-error" role="alert">{{ errorMessage }}</p>

      <div v-if="!posts.length" class="media-empty">
        还没有已发布文章，请前往 <NuxtLink to="/admin/write">发布文章</NuxtLink>。
      </div>
      <div v-else class="posts-admin-layout">
        <section class="home-admin-section posts-admin-list-panel">
          <div class="home-admin-section__heading">
            <div>
              <p class="eyebrow">已发布文章</p>
              <h2>修改或删除线上内容。</h2>
            </div>
            <span>共 {{ posts.length }} 篇</span>
          </div>
          <ol class="posts-admin-list">
            <li v-for="(post, index) in posts" :key="post.id">
              <button
                class="posts-admin-list__item"
                :class="{ 'posts-admin-list__item--active': selectedPostId === post.id }"
                type="button"
                @click="selectPost(post)"
              >
                <span>{{ String(index + 1).padStart(2, '0') }}</span>
                <strong>{{ post.title }}</strong>
                <small>{{ post.category.name }}</small>
              </button>
            </li>
          </ol>
        </section>

        <form class="home-admin-section post-editor" novalidate @submit.prevent="savePost">
          <div class="home-admin-section__heading">
            <div>
              <p class="eyebrow">修改文章</p>
              <h2>{{ form.title }}</h2>
            </div>
            <span>修改后仍保持发布状态</span>
          </div>
          <AdminPostEditorFields
            v-model="form"
            :categories="categories"
            :cover-url="coverUrl"
            @cover-uploaded="coverUrl = $event.publicUrl"
            @cover-removed="coverUrl = ''"
            @upload-error="errorMessage = $event"
            @imported="notice = `已导入 ${$event}，保存后生效。`"
            @import-error="errorMessage = $event"
          />
          <div class="project-editor__actions post-editor__actions">
            <button class="button" type="submit" :disabled="!!busyKey">
              {{ busyKey === 'save' ? '正在保存…' : '保存修改' }}
            </button>
            <button
              class="admin-danger-button"
              type="button"
              :disabled="!!busyKey"
              @click="deletePost"
            >
              删除文章
            </button>
          </div>
        </form>
      </div>
    </template>
  </div>
</template>
