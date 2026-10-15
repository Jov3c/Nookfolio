<script setup lang="ts">
import { PROJECT_STATUS_LABELS } from '#shared/constants/project';
import type { PublicProject } from '~/types/project';
import { getProjectCardPressMotion } from '~/utils/project-card-motion';

defineProps<{ project: PublicProject }>();

const card = ref<HTMLElement | null>(null);
const spotlight = ref<HTMLElement | null>(null);
let activePointerId: number | null = null;
let returnAnimation: Animation | null = null;
let captureTarget: HTMLElement | null = null;

function updatePress(event: PointerEvent) {
  if (event.pointerId !== activePointerId || !card.value || !spotlight.value) return;
  const bounds = card.value.getBoundingClientRect();
  const motion = getProjectCardPressMotion(event, bounds);
  card.value.style.transform = `perspective(800px) rotateX(${motion.rotateX}deg) rotateY(${motion.rotateY}deg) scale(0.99)`;
  spotlight.value.style.transform = `translate3d(${motion.spotlightX - 40}px, ${motion.spotlightY - 40}px, 0)`;
}

function beginPress(event: PointerEvent) {
  if (event.button !== 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!card.value) return;
  returnAnimation?.cancel();
  activePointerId = event.pointerId;
  captureTarget = event.target instanceof HTMLElement ? event.target : card.value;
  captureTarget.setPointerCapture(event.pointerId);
  card.value.classList.add('project-card--pressing');
  updatePress(event);
}

function endPress(event: PointerEvent) {
  if (event.pointerId !== activePointerId || !card.value) return;
  const element = card.value;
  const startTransform = element.style.transform;
  const hoverOffset =
    event.pointerType === 'mouse' && element.matches(':hover') ? 'translateY(-2px) ' : '';
  const restingTransform = `${hoverOffset}perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)`;

  activePointerId = null;
  element.classList.remove('project-card--pressing');
  if (captureTarget?.hasPointerCapture(event.pointerId)) {
    captureTarget.releasePointerCapture(event.pointerId);
  }
  captureTarget = null;
  element.style.transform = '';
  returnAnimation = element.animate(
    [
      { transform: startTransform },
      {
        transform: `${hoverOffset}perspective(800px) rotateX(-0.25deg) rotateY(0.25deg) scale(1.002)`,
        offset: 0.68,
      },
      { transform: restingTransform },
    ],
    { duration: 500, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' },
  );
  returnAnimation.addEventListener('finish', () => (returnAnimation = null), { once: true });
}
</script>

<template>
  <article
    ref="card"
    class="project-card"
    @pointerdown="beginPress"
    @pointermove="updatePress"
    @pointerup="endPress"
    @pointercancel="endPress"
    @lostpointercapture="endPress"
  >
    <span ref="spotlight" class="project-card__press-light" aria-hidden="true" />
    <div class="project-card__head">
      <h2 class="project-card__name">
        <NuxtLink :to="`/projects/${project.slug}`">{{ project.name }}</NuxtLink>
      </h2>
      <span class="status-pill" :data-status="project.status.toLowerCase()">
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
      >
        项目源码 ↗
      </a>
      <span v-else class="project-card__action project-card__action--muted">项目源码</span>
      <a
        v-if="project.demoUrl"
        class="project-card__action"
        :href="project.demoUrl"
        target="_blank"
        rel="noopener noreferrer"
      >
        在线预览 ↗
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
