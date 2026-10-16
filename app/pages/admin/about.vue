<script setup lang="ts">
import type { AboutProfile, AboutProfileResponse } from '~/types/about';

definePageMeta({ layout: 'admin', middleware: 'admin' });

const profile = reactive<AboutProfile>({
  eyebrow: '',
  title: '',
  introduction: '',
  personalTitle: '',
  personalBody: '',
  quote: '',
  siteTitle: '',
  siteBody: '',
  siteFacts: [],
  updatedAt: '',
});
const isLoading = ref(true);
const isSaving = ref(false);
const notice = ref('');
const errorMessage = ref('');

useSeoMeta({ title: 'About 页面 — Nookfolio 管理后台', robots: 'noindex, nofollow' });

async function load() {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const result = await $fetch<AboutProfileResponse>('/api/v1/admin/about');
    Object.assign(profile, result.data, {
      siteFacts: result.data.siteFacts.map((fact) => ({ ...fact })),
    });
  } catch {
    errorMessage.value = 'About 页面配置加载失败，请刷新重试。';
  } finally {
    isLoading.value = false;
  }
}

function addFact() {
  if (profile.siteFacts.length < 8) profile.siteFacts.push({ label: '', value: '' });
}

function removeFact(index: number) {
  if (profile.siteFacts.length > 1) profile.siteFacts.splice(index, 1);
}

async function save() {
  isSaving.value = true;
  notice.value = '';
  errorMessage.value = '';
  try {
    const result = await $fetch<AboutProfileResponse>('/api/v1/admin/about', {
      method: 'PATCH',
      body: {
        eyebrow: profile.eyebrow,
        title: profile.title,
        introduction: profile.introduction,
        personalTitle: profile.personalTitle,
        personalBody: profile.personalBody,
        quote: profile.quote,
        siteTitle: profile.siteTitle,
        siteBody: profile.siteBody,
        siteFacts: profile.siteFacts,
      },
    });
    Object.assign(profile, result.data, {
      siteFacts: result.data.siteFacts.map((fact) => ({ ...fact })),
    });
    notice.value = 'About 页面已保存。';
    await refreshNuxtData('public-about');
  } catch {
    errorMessage.value = '保存失败，请检查所有字段后重试。';
  } finally {
    isSaving.value = false;
  }
}

await load();
</script>

<template>
  <div class="about-admin">
    <header class="admin-page-header">
      <div>
        <p class="eyebrow">资料管理 / ABOUT</p>
        <h1>About 页面</h1>
        <p>独立维护关于页面内容，不会修改首页个人身份或个人简历。</p>
      </div>
      <NuxtLink class="admin-secondary-button" to="/about" target="_blank">查看公开页面 ↗</NuxtLink>
    </header>
    <AdminNotice :message="notice" />
    <p v-if="errorMessage" class="admin-notice admin-notice--error" role="alert">
      {{ errorMessage }}
    </p>
    <p v-if="isLoading" class="media-empty">正在加载 About 页面…</p>
    <form v-else class="admin-panel about-admin-form-grid" @submit.prevent="save">
      <label
        ><span>页面眉题</span><input v-model="profile.eyebrow" maxlength="120" required
      /></label>
      <label><span>主标题</span><input v-model="profile.title" maxlength="220" required /></label>
      <label class="about-admin-form-grid__wide"
        ><span>页面引言</span
        ><textarea v-model="profile.introduction" rows="3" maxlength="500" required />
      </label>
      <label
        ><span>个人章节标题</span><input v-model="profile.personalTitle" maxlength="120" required
      /></label>
      <label><span>引用文字</span><input v-model="profile.quote" maxlength="500" required /></label>
      <label class="about-admin-form-grid__wide"
        ><span>个人章节正文</span
        ><textarea v-model="profile.personalBody" rows="8" maxlength="20000" required />
      </label>
      <label
        ><span>网站章节标题</span><input v-model="profile.siteTitle" maxlength="120" required
      /></label>
      <label class="about-admin-form-grid__wide"
        ><span>网站章节正文</span
        ><textarea v-model="profile.siteBody" rows="6" maxlength="20000" required />
      </label>
      <section class="about-admin-form-grid__wide about-facts-editor">
        <div class="about-admin-card__heading">
          <div><strong>网站信息</strong><small>最多添加 8 项</small></div>
          <button
            class="admin-secondary-button"
            type="button"
            :disabled="profile.siteFacts.length >= 8"
            @click="addFact"
          >
            添加信息
          </button>
        </div>
        <div v-for="(fact, index) in profile.siteFacts" :key="index" class="about-fact-row">
          <label><span>标签</span><input v-model="fact.label" maxlength="80" required /></label>
          <label><span>内容</span><input v-model="fact.value" maxlength="160" required /></label>
          <button
            class="admin-danger-button"
            type="button"
            :disabled="profile.siteFacts.length <= 1"
            :aria-label="`删除第 ${index + 1} 项网站信息`"
            @click="removeFact(index)"
          >
            删除
          </button>
        </div>
      </section>
      <div class="about-admin-actions about-admin-form-grid__wide">
        <button class="admin-primary-button" type="submit" :disabled="isSaving">
          {{ isSaving ? '正在保存…' : '保存 About 页面' }}
        </button>
      </div>
    </form>
  </div>
</template>
