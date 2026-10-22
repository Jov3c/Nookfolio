<script setup lang="ts">
import { PROJECT_STATUS_LABELS } from '#shared/constants/project';
import type { PublicProject } from '~/types/project';

defineProps<{ project: PublicProject }>();
</script>

<template>
  <article class="project-card">
    <NuxtLink
      class="project-card__link"
      :to="`/projects/${project.slug}`"
      :aria-label="`阅读 ${project.name} 的项目说明`"
    />
    <div class="project-card__head">
      <h2 class="project-card__name">
        <NuxtLink :to="`/projects/${project.slug}`">{{ project.name }}</NuxtLink>
      </h2>
      <span class="project-card__status">
        <i
          class="project-card__status-dot"
          :data-status="project.status.toLowerCase()"
          aria-hidden="true"
        />
        {{ PROJECT_STATUS_LABELS[project.status] }}
      </span>
    </div>

    <p class="project-card__description">{{ project.summary }}</p>

    <div class="project-card__actions" aria-label="项目链接">
      <a
        v-if="project.githubUrl"
        class="project-card__action"
        :href="project.githubUrl"
        target="_blank"
        rel="noopener noreferrer"
        @click.stop
      >
        项目源码
      </a>
      <span v-else class="project-card__action project-card__action--muted">项目源码</span>
      <a
        v-if="project.demoUrl"
        class="project-card__action"
        :href="project.demoUrl"
        target="_blank"
        rel="noopener noreferrer"
        @click.stop
      >
        在线预览
      </a>
      <span
        v-else
        class="project-card__action project-card__action--disabled"
        aria-disabled="true"
        title="暂无在线预览"
      >
        在线预览
      </span>
    </div>

    <ul class="tag-list" aria-label="技术栈">
      <li v-for="technology in project.techStack" :key="technology">{{ technology }}</li>
    </ul>
  </article>
</template>
