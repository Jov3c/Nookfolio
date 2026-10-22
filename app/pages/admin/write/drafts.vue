<script setup lang="ts">
import type { AdminPost } from '~/types/blog';

definePageMeta({ layout: 'admin', middleware: 'admin' });

const drafts = ref<AdminPost[]>([]);
const isLoading = ref(true);
const busyId = ref('');
const errorMessage = ref('');
const notice = ref('');

useSeoMeta({ title: '草稿箱 — Nookfolio 管理后台', robots: 'noindex, nofollow' });

async function load() {
  try {
    const result = await $fetch<{ data: AdminPost[] }>('/api/v1/admin/posts', {
      query: { status: 'DRAFT', page: 1, pageSize: 100 },
    });
    drafts.value = result.data;
  } catch {
    errorMessage.value = '草稿加载失败，请刷新重试。';
  } finally {
    isLoading.value = false;
  }
}

async function deleteDraft(draft: AdminPost) {
  if (!window.confirm(`确定删除草稿「${draft.title}」吗？`)) return;
  busyId.value = draft.id;
  errorMessage.value = '';
  try {
    await $fetch(`/api/v1/admin/posts/${draft.id}`, { method: 'DELETE' });
    drafts.value = drafts.value.filter((item) => item.id !== draft.id);
    notice.value = '草稿已删除。';
  } catch {
    errorMessage.value = '草稿删除失败，请稍后重试。';
  } finally {
    busyId.value = '';
  }
}

onMounted(load);
</script>

<template>
  <div class="posts-admin admin-editorial-page">
    <header class="admin-page-heading">
      <div>
        <p>内容管理 / 发布文章 / 草稿箱</p>
        <h1>草稿箱</h1>
      </div>
      <NuxtLink class="button" to="/admin/write">新建文章</NuxtLink>
    </header>
    <AdminNotice :message="notice" />
    <p v-if="errorMessage" class="admin-error" role="alert">{{ errorMessage }}</p>
    <p v-if="isLoading" class="media-empty">正在加载草稿…</p>
    <div v-else-if="!drafts.length" class="media-empty">还没有草稿。</div>
    <section v-else class="home-admin-section">
      <div class="home-admin-section__heading">
        <div>
          <p class="eyebrow">自动保存</p>
          <h2>尚未发布的文章</h2>
        </div>
        <span>共 {{ drafts.length }} 篇</span>
      </div>
      <ol class="draft-list">
        <li v-for="draft in drafts" :key="draft.id">
          <div>
            <strong>{{ draft.title }}</strong>
            <small
              >{{ draft.category.name }} · 最后更新
              {{ new Date(draft.updatedAt).toLocaleString('zh-CN') }}</small
            >
          </div>
          <div class="draft-list__actions">
            <NuxtLink class="admin-secondary-button" :to="`/admin/write?draft=${draft.id}`"
              >继续编辑</NuxtLink
            >
            <button
              class="admin-danger-button"
              type="button"
              :disabled="busyId === draft.id"
              @click="deleteDraft(draft)"
            >
              删除
            </button>
          </div>
        </li>
      </ol>
    </section>
  </div>
</template>
