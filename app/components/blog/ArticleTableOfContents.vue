<script setup lang="ts">
import {
  createHeadingId,
  getReadingProgress,
  hasArticleTableOfContents,
} from '~/utils/blog-reading';

const props = defineProps<{
  articleRoot: HTMLElement | null;
  contentRoot: HTMLElement | null;
}>();
const emit = defineEmits<{ headingsChange: [available: boolean] }>();

interface TocHeading {
  id: string;
  label: string;
  level: number;
}

const headings = ref<TocHeading[]>([]);
const activeId = ref('');
const progress = ref(0);
let headingObserver: IntersectionObserver | undefined;
let frame = 0;

function collectHeadings() {
  if (!props.contentRoot) return;
  const used = new Set<string>();
  headings.value = [...props.contentRoot.querySelectorAll<HTMLElement>('h2, h3')].map((heading) => {
    const id = createHeadingId(heading.textContent ?? '', used);
    heading.id = id;
    return {
      id,
      label: heading.textContent?.trim() || '未命名章节',
      level: Number(heading.tagName[1]),
    };
  });
  emit('headingsChange', hasArticleTableOfContents(headings.value));
  activeId.value = headings.value[0]?.id ?? '';
  observeHeadings();
}

function observeHeadings() {
  headingObserver?.disconnect();
  headingObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries.find((entry) => entry.isIntersecting);
      if (visible) activeId.value = visible.target.id;
    },
    { rootMargin: '-18% 0px -68% 0px' },
  );
  props.contentRoot
    ?.querySelectorAll('h2, h3')
    .forEach((heading) => headingObserver?.observe(heading));
}

function updateProgress() {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    if (!props.articleRoot) return;
    const bounds = props.articleRoot.getBoundingClientRect();
    const articleTop = window.scrollY + bounds.top;
    progress.value = getReadingProgress(
      window.scrollY,
      articleTop,
      props.articleRoot.scrollHeight,
      window.innerHeight,
    );
  });
}

function jumpTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

watch(() => props.contentRoot, collectHeadings, { flush: 'post' });

onMounted(() => {
  collectHeadings();
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
});

onBeforeUnmount(() => {
  headingObserver?.disconnect();
  cancelAnimationFrame(frame);
  window.removeEventListener('scroll', updateProgress);
  window.removeEventListener('resize', updateProgress);
});
</script>

<template>
  <aside v-if="headings.length" class="article-toc" aria-label="文章目录">
    <details class="article-toc__mobile">
      <summary>文章目录 · {{ Math.round(progress * 100) }}%</summary>
      <ol>
        <li v-for="heading in headings" :key="heading.id">
          <button
            type="button"
            :class="{ 'is-active': activeId === heading.id, 'is-subheading': heading.level === 3 }"
            @click="jumpTo(heading.id)"
          >
            {{ heading.label }}
          </button>
        </li>
      </ol>
    </details>
    <div class="article-toc__desktop">
      <p>ON THIS PAGE</p>
      <ol>
        <li v-for="(heading, index) in headings" :key="heading.id">
          <button
            type="button"
            :class="{ 'is-active': activeId === heading.id, 'is-subheading': heading.level === 3 }"
            @click="jumpTo(heading.id)"
          >
            <span>{{ String(index + 1).padStart(2, '0') }}</span
            >{{ heading.label }}
          </button>
        </li>
      </ol>
      <div class="article-toc__progress" aria-hidden="true">
        <i :style="{ transform: `scaleX(${progress})` }" />
      </div>
      <small>已阅读 {{ Math.round(progress * 100) }}%</small>
    </div>
  </aside>
</template>
