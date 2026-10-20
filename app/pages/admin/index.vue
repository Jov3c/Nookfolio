<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' });

const admin = useAdminSession();
const { data: statsResponse, pending } = await useFetch<{
  data: { totalPageViews: number; onlineVisitors: number };
}>('/api/v1/public/site/stats', { key: 'admin-site-stats' });

const overview = computed(() => [
  {
    label: '累计访问量',
    value: statsResponse.value?.data.totalPageViews.toLocaleString('zh-CN') ?? '—',
  },
  {
    label: '当前在线',
    value: statsResponse.value?.data.onlineVisitors.toLocaleString('zh-CN') ?? '—',
  },
]);

const contentAssets = [
  { label: '文章', note: '发布与维护内容', to: '/admin/posts' },
  { label: '项目', note: '整理作品展示', to: '/admin/projects' },
  { label: '资料', note: '配置首页与关于页', to: '/admin/home' },
];

const createActions = [
  { label: '新建文章', note: '进入 Markdown 编辑器', to: '/admin/write' },
  { label: '继续草稿', note: '查看自动保存的内容', to: '/admin/write/drafts' },
];

const inboxActions = [
  { label: '评论', to: '/admin/comments' },
  { label: '留言', to: '/admin/messages' },
  { label: '友链', to: '/admin/links' },
];

useSeoMeta({ title: '仪表盘 — Nookfolio 管理后台', robots: 'noindex, nofollow' });
</script>

<template>
  <div class="admin-dashboard admin-floating-dashboard">
    <header class="admin-dashboard-intro">
      <div>
        <p>管理概览</p>
        <h1>{{ admin?.displayName }}，欢迎回来。</h1>
      </div>
      <span>{{ pending ? '正在同步站点数据…' : '站点数据已同步' }}</span>
    </header>

    <section
      class="admin-dashboard-island admin-dashboard-island--assets"
      aria-labelledby="assets-heading"
    >
      <div class="admin-dashboard-island__heading">
        <div>
          <p>内容资产</p>
          <h2 id="assets-heading">管理你的站点</h2>
        </div>
        <span>常用入口</span>
      </div>
      <div class="admin-dashboard-assets">
        <NuxtLink v-for="item in contentAssets" :key="item.to" :to="item.to">
          <strong>{{ item.label }}</strong
          ><small>{{ item.note }}</small
          ><b>↗</b>
        </NuxtLink>
      </div>
    </section>

    <section
      class="admin-dashboard-island admin-dashboard-island--recent"
      aria-labelledby="recent-heading"
    >
      <div class="admin-dashboard-island__heading">
        <div>
          <p>最近编辑</p>
          <h2 id="recent-heading">接着上次继续</h2>
        </div>
      </div>
      <div class="admin-dashboard-empty">
        <strong>尚未连接最近编辑记录</strong>
        <span>编辑记录可用后会在这里显示，不会使用模拟内容。</span>
      </div>
    </section>

    <section
      class="admin-dashboard-island admin-dashboard-island--create"
      aria-labelledby="create-heading"
    >
      <div class="admin-dashboard-island__heading">
        <div>
          <p>快速创作</p>
          <h2 id="create-heading">从一个想法开始</h2>
        </div>
      </div>
      <NuxtLink
        v-for="item in createActions"
        :key="item.to"
        :to="item.to"
        class="admin-dashboard-action"
      >
        <span
          ><strong>{{ item.label }}</strong
          ><small>{{ item.note }}</small></span
        ><b>＋</b>
      </NuxtLink>
    </section>

    <section
      class="admin-dashboard-island admin-dashboard-island--activity"
      aria-labelledby="activity-heading"
    >
      <div class="admin-dashboard-island__heading">
        <div>
          <p>站点活动</p>
          <h2 id="activity-heading">真实访问数据</h2>
        </div>
        <span>{{ pending ? '更新中' : '实时' }}</span>
      </div>
      <div class="admin-dashboard-metrics">
        <article v-for="item in overview" :key="item.label">
          <strong>{{ item.value }}</strong
          ><span>{{ item.label }}</span>
        </article>
      </div>
      <p class="admin-dashboard-note">近七日趋势尚未接入，当前仅展示站点已有统计。</p>
    </section>

    <section
      class="admin-dashboard-island admin-dashboard-island--inbox"
      aria-labelledby="inbox-heading"
    >
      <div class="admin-dashboard-island__heading">
        <div>
          <p>互动收件箱</p>
          <h2 id="inbox-heading">处理社区消息</h2>
        </div>
      </div>
      <nav class="admin-dashboard-inbox" aria-label="互动管理入口">
        <NuxtLink v-for="item in inboxActions" :key="item.to" :to="item.to">
          <span>{{ item.label }}</span
          ><b>查看</b>
        </NuxtLink>
      </nav>
    </section>

    <section
      class="admin-dashboard-island admin-dashboard-island--status"
      aria-labelledby="status-heading"
    >
      <div class="admin-dashboard-island__heading">
        <div>
          <p>站点状态</p>
          <h2 id="status-heading">服务连接</h2>
        </div>
        <i :data-online="Boolean(statsResponse?.data)"></i>
      </div>
      <p>
        {{
          pending
            ? '正在检查统计服务…'
            : statsResponse?.data
              ? '站点统计服务连接正常。'
              : '暂时无法读取站点统计。'
        }}
      </p>
      <NuxtLink to="/" target="_blank">查看公开站点 ↗</NuxtLink>
    </section>
  </div>
</template>
