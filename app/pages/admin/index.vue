<script setup lang="ts">
import type { AdminPost } from '~/types/blog';
import type { AdminComment, AdminMessage } from '~/types/community';
import type { AdminFriendLinksResponse } from '~/types/friend-links';

definePageMeta({ layout: 'admin', middleware: 'admin' });

const admin = useAdminSession();
const publishedPosts = ref<AdminPost[]>([]);
const drafts = ref<AdminPost[]>([]);
const publishedTotal = ref(0);
const draftTotal = ref(0);
const pendingCount = ref(0);
const isLoadingWorkspace = ref(true);
const workspaceError = ref('');

const { data: statsResponse, pending: statsPending } = await useFetch<{
  data: { totalPageViews: number; onlineVisitors: number };
}>('/api/v1/public/site/stats', { key: 'admin-site-stats' });

const latestDraft = computed(() => drafts.value[0] ?? null);
const recentPosts = computed(() =>
  [...publishedPosts.value, ...drafts.value]
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 4),
);
const metrics = computed(() => [
  { label: '已发布文章', value: publishedTotal.value, to: '/admin/posts' },
  { label: '草稿', value: draftTotal.value, to: '/admin/write/drafts' },
  { label: '待处理互动', value: pendingCount.value, to: '/admin/comments' },
]);

async function loadWorkspace() {
  isLoadingWorkspace.value = true;
  workspaceError.value = '';
  try {
    const [published, draftResult, comments, messages, links] = await Promise.all([
      $fetch<{ data: AdminPost[]; meta: { total: number } }>('/api/v1/admin/posts', {
        query: { status: 'PUBLISHED', page: 1, pageSize: 100 },
      }),
      $fetch<{ data: AdminPost[]; meta: { total: number } }>('/api/v1/admin/posts', {
        query: { status: 'DRAFT', page: 1, pageSize: 100 },
      }),
      $fetch<{ data: AdminComment[]; meta: { total: number } }>('/api/v1/admin/comments', {
        query: { status: 'PENDING_REVIEW', page: 1, pageSize: 100 },
      }),
      $fetch<{ data: AdminMessage[]; meta: { total: number } }>('/api/v1/admin/messages', {
        query: { status: 'PENDING_REVIEW', page: 1, pageSize: 100 },
      }),
      $fetch<AdminFriendLinksResponse>('/api/v1/admin/links', {
        query: { status: 'PENDING_REVIEW', page: 1, pageSize: 100 },
      }),
    ]);
    publishedPosts.value = published.data;
    drafts.value = draftResult.data;
    publishedTotal.value = published.meta.total;
    draftTotal.value = draftResult.meta.total;
    pendingCount.value = comments.meta.total + messages.meta.total + links.meta.total;
  } catch {
    workspaceError.value = '工作台数据暂时无法读取，请稍后刷新。';
  } finally {
    isLoadingWorkspace.value = false;
  }
}

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit' }).format(
    new Date(value),
  );
}

onMounted(loadWorkspace);
useSeoMeta({ title: '仪表盘 — Nookfolio 管理后台', robots: 'noindex, nofollow' });
</script>

<template>
  <div class="admin-dashboard">
    <header class="admin-dashboard-intro">
      <div>
        <p>OVERVIEW / 概览</p>
        <h1>{{ admin?.displayName }}，今天从哪里继续？</h1>
      </div>
      <span>{{ isLoadingWorkspace ? '正在同步内容…' : '内容工作台已就绪' }}</span>
    </header>

    <p v-if="workspaceError" class="admin-dashboard-error">{{ workspaceError }}</p>

    <section class="admin-dashboard-panel admin-dashboard-panel--metrics" aria-label="核心数据">
      <NuxtLink v-for="item in metrics" :key="item.label" :to="item.to">
        <span>{{ item.label }}</span>
        <strong>{{ isLoadingWorkspace ? '—' : item.value }}</strong>
      </NuxtLink>
    </section>

    <section class="admin-dashboard-panel admin-dashboard-panel--writing">
      <div class="admin-dashboard-panel__heading">
        <div>
          <p>WRITING</p>
          <h2>继续写作</h2>
        </div>
        <NuxtLink to="/admin/write">新建文章</NuxtLink>
      </div>
      <NuxtLink
        v-if="latestDraft"
        class="admin-dashboard-draft"
        :to="`/admin/write?draft=${latestDraft.id}`"
      >
        <span>最近编辑于 {{ formatUpdatedAt(latestDraft.updatedAt) }}</span>
        <strong>{{ latestDraft.title || '未命名草稿' }}</strong>
        <small>{{ latestDraft.excerpt || '继续整理这篇文章的内容。' }}</small>
      </NuxtLink>
      <div v-else class="admin-dashboard-empty">
        <strong>暂无草稿，开始写一篇新文章</strong>
        <NuxtLink to="/admin/write">进入编辑器</NuxtLink>
      </div>
    </section>

    <section class="admin-dashboard-panel admin-dashboard-panel--recent">
      <div class="admin-dashboard-panel__heading">
        <div>
          <p>RECENT</p>
          <h2>最近翻阅</h2>
        </div>
        <NuxtLink to="/admin/posts">全部文章</NuxtLink>
      </div>
      <div v-if="recentPosts.length" class="admin-dashboard-recent-list">
        <NuxtLink
          v-for="post in recentPosts"
          :key="post.id"
          :to="post.status === 'DRAFT' ? `/admin/write?draft=${post.id}` : '/admin/posts'"
        >
          <span>{{ formatUpdatedAt(post.updatedAt) }}</span>
          <strong>{{ post.title || '未命名文章' }}</strong>
          <small>{{ post.status === 'DRAFT' ? '草稿' : '已发布' }}</small>
        </NuxtLink>
      </div>
      <div v-else class="admin-dashboard-empty admin-dashboard-empty--compact">
        还没有内容记录。
      </div>
    </section>

    <section class="admin-dashboard-panel admin-dashboard-panel--pending">
      <div class="admin-dashboard-panel__heading">
        <div>
          <p>INBOX</p>
          <h2>待处理</h2>
        </div>
        <strong>{{ isLoadingWorkspace ? '—' : pendingCount }}</strong>
      </div>
      <p v-if="pendingCount === 0 && !isLoadingWorkspace">当前没有需要处理的互动。</p>
      <nav v-else aria-label="互动处理入口">
        <NuxtLink to="/admin/comments">评论管理</NuxtLink>
        <NuxtLink to="/admin/messages">留言管理</NuxtLink>
        <NuxtLink to="/admin/links">友链申请</NuxtLink>
      </nav>
    </section>

    <section class="admin-dashboard-panel admin-dashboard-panel--health">
      <div>
        <i :data-online="Boolean(statsResponse?.data)" />
        <span>{{
          statsPending
            ? '正在检查站点状态'
            : statsResponse?.data
              ? '公开站点运行正常'
              : '站点状态暂时不可用'
        }}</span>
      </div>
      <p>
        <strong>{{ statsResponse?.data.totalPageViews.toLocaleString('zh-CN') ?? '—' }}</strong>
        累计访问 · {{ statsResponse?.data.onlineVisitors ?? '—' }} 人在线
      </p>
    </section>
  </div>
</template>
