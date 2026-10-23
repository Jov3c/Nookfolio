<script setup lang="ts">
import { renderMarkdown } from '#shared/markdown';
import type { BlogCategory } from '~/types/blog';
import type { PostEditorFormValue } from '~/utils/post-editor';

withDefaults(
  defineProps<{
    categories: BlogCategory[];
    coverUrl?: string | null;
    showSlug?: boolean;
  }>(),
  { coverUrl: null, showSlug: true },
);
const emit = defineEmits<{
  imported: [fileName: string];
  importError: [message: string];
  coverUploaded: [media: { id: string; publicUrl: string }];
  coverRemoved: [];
  uploadError: [message: string];
}>();
const form = defineModel<PostEditorFormValue>({ required: true });
const previewHtml = computed(() => renderMarkdown(form.value.markdownBody));

async function importMarkdown(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;
  if (!file.name.toLowerCase().endsWith('.md')) {
    emit('importError', '只能导入 .md 文件。');
    return;
  }
  form.value.markdownBody = await file.text();
  emit('imported', file.name);
}
</script>

<template>
  <div v-if="!categories.length" class="admin-error">
    请先在 <NuxtLink to="/admin/categories">分类管理</NuxtLink> 中创建分类。
  </div>
  <div class="post-form-grid">
    <label><span>标题</span><input v-model="form.title" maxlength="220" /></label>
    <label v-if="showSlug"
      ><span>路径标识</span><input v-model="form.slug" maxlength="160"
    /></label>
    <label>
      <span>分类</span>
      <select v-model="form.categoryId">
        <option disabled value="">请选择分类</option>
        <option v-for="category in categories" :key="category.id" :value="category.id">
          {{ category.name }}
        </option>
      </select>
    </label>
    <AdminDirectImageUpload
      label="文章封面"
      category="blog"
      crop="center-square"
      :current-url="coverUrl"
      :fallback-text="form.title || '封面'"
      :alt-text="`${form.title || '文章'}封面`"
      @uploaded="
        form.coverMediaId = $event.id;
        emit('coverUploaded', $event);
      "
      @removed="
        form.coverMediaId = '';
        emit('coverRemoved');
      "
      @error="emit('uploadError', $event)"
    />
    <label class="post-form-grid__wide">
      <span>摘要</span>
      <textarea v-model="form.excerpt" rows="2" maxlength="500" />
    </label>
    <label><span>SEO 标题</span><input v-model="form.seoTitle" maxlength="220" /></label>
    <label><span>SEO 描述</span><input v-model="form.seoDescription" maxlength="320" /></label>
  </div>

  <section class="post-editor__markdown">
    <div class="project-editor__subheading">
      <div>
        <p class="eyebrow">文章 Markdown</p>
        <h3>一次编写，安全渲染。</h3>
      </div>
      <label class="admin-secondary-button project-import-button">
        导入 .md
        <input
          class="project-file-input"
          type="file"
          accept=".md,text/markdown"
          @change="importMarkdown"
        />
      </label>
    </div>
    <AdminMarkdownEditor v-model="form.markdownBody" :preview-html="previewHtml" />
  </section>
</template>
