<script setup lang="ts">
withDefaults(
  defineProps<{
    previewHtml: string;
    sourceLabel?: string;
    textareaLabel?: string;
  }>(),
  { sourceLabel: 'Markdown 源码', textareaLabel: 'Markdown 源码' },
);

const model = defineModel<string>({ required: true });
const activePane = ref<'source' | 'preview'>('source');
const uid = useId();
const sourceId = `markdown-source-${uid}`;
const previewId = `markdown-preview-${uid}`;
</script>

<template>
  <div class="admin-markdown-editor">
    <div class="admin-markdown-editor__tabs" role="tablist" aria-label="编辑器视图">
      <button
        type="button"
        role="tab"
        :aria-selected="activePane === 'source'"
        :aria-controls="sourceId"
        @click="activePane = 'source'"
      >
        源码
      </button>
      <button
        type="button"
        role="tab"
        :aria-selected="activePane === 'preview'"
        :aria-controls="previewId"
        @click="activePane = 'preview'"
      >
        预览
      </button>
    </div>
    <div class="project-editor__markdown-grid">
      <label
        :id="sourceId"
        class="project-markdown-input admin-markdown-editor__pane"
        :data-active="activePane === 'source'"
      >
        <span>{{ sourceLabel }}</span>
        <textarea v-model="model" rows="22" spellcheck="false" :aria-label="textareaLabel" />
      </label>
      <div
        :id="previewId"
        class="project-markdown-preview admin-markdown-editor__pane"
        :data-active="activePane === 'preview'"
      >
        <span>实时预览</span>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="readme__content" v-html="previewHtml" />
      </div>
    </div>
  </div>
</template>
