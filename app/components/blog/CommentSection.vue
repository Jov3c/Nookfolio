<script setup lang="ts">
import type { PublicComment, PublicCommentsResponse } from '~/types/community';

const props = defineProps<{ slug: string }>();
const { nickname, email } = useVisitorIdentity();
const form = reactive({ content: '', captchaChallengeId: '', captchaAnswer: '', website: '' });
const comments = ref<PublicComment[]>([]);
const page = ref(1);
const total = ref(0);
const publishedTotal = ref(0);
const isLoading = ref(true);
const isLoadingMore = ref(false);
const isSubmitting = ref(false);
const notice = ref('');
const errorMessage = ref('');
const replyingTo = ref<{ id: string; nickname: string } | null>(null);
const captcha = ref<{ refresh: () => Promise<void> } | null>(null);

function mergeUniqueThreads(current: PublicComment[], incoming: PublicComment[]) {
  const known = new Set(current.map((item) => item.id));
  return [...current, ...incoming.filter((item) => !known.has(item.id))];
}

async function load(targetPage = 1) {
  const response = await $fetch<PublicCommentsResponse>(
    `/api/v1/public/posts/${encodeURIComponent(props.slug)}/comments`,
    { query: { page: targetPage, pageSize: 20 } },
  );
  comments.value =
    targetPage === 1 ? response.data : mergeUniqueThreads(comments.value, response.data);
  page.value = targetPage;
  total.value = response.meta.total;
  publishedTotal.value = response.meta.publishedTotal;
}

onMounted(async () => {
  try {
    await load();
  } catch {
    errorMessage.value = '评论暂时无法加载。';
  } finally {
    isLoading.value = false;
  }
});

function formatDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(new Date(value))
    .replaceAll('/', '.');
}

function startReply(id: string, targetNickname: string) {
  replyingTo.value = { id, nickname: targetNickname };
  notice.value = '';
  errorMessage.value = '';
}

function cancelReply() {
  replyingTo.value = null;
}

async function loadMore() {
  isLoadingMore.value = true;
  try {
    await load(page.value + 1);
  } finally {
    isLoadingMore.value = false;
  }
}

async function submit() {
  if (!form.captchaChallengeId) return;
  isSubmitting.value = true;
  notice.value = '';
  errorMessage.value = '';
  const replyTarget = replyingTo.value;
  const content = form.content;
  try {
    const endpoint = replyTarget
      ? `/api/v1/public/posts/${encodeURIComponent(props.slug)}/comments/${replyTarget.id}/replies`
      : `/api/v1/public/posts/${encodeURIComponent(props.slug)}/comments`;
    await $fetch(endpoint, {
      method: 'POST',
      body: {
        nickname: nickname.value,
        email: email.value || undefined,
        content,
        captchaChallengeId: form.captchaChallengeId,
        captchaAnswer: form.captchaAnswer,
        website: form.website,
      },
    });
    form.content = '';
    replyingTo.value = null;
    notice.value = replyTarget ? '回复已发布。' : '评论已发布。';
    await load();
  } catch (error) {
    const fetchError = error as { data?: { error?: { message?: string } } };
    errorMessage.value = fetchError.data?.error?.message || '提交失败，内容已为你保留。';
  } finally {
    await captcha.value?.refresh();
    isSubmitting.value = false;
  }
}
</script>

<template>
  <section class="comment-section" aria-labelledby="comments-title">
    <div class="community-section-heading">
      <div>
        <p class="eyebrow">Conversation</p>
        <h2 id="comments-title">评论</h2>
      </div>
      <span>{{ publishedTotal }} 条已公开</span>
    </div>

    <form class="community-composer" @submit.prevent="submit">
      <div v-if="replyingTo" class="community-reply-target">
        回复 {{ replyingTo.nickname }}
        <button type="button" @click="cancelReply">取消</button>
      </div>
      <textarea
        v-model="form.content"
        required
        maxlength="4000"
        placeholder="分享你的想法…"
        aria-label="评论内容"
      />
      <input
        v-model="form.website"
        class="community-honeypot"
        tabindex="-1"
        autocomplete="off"
        aria-hidden="true"
      />
      <div class="community-composer__identity">
        <input v-model="nickname" required maxlength="80" placeholder="昵称 *" aria-label="昵称" />
        <input
          v-model="email"
          type="email"
          maxlength="254"
          placeholder="邮箱（选填，不公开）"
          aria-label="邮箱"
        />
      </div>
      <CommunityCaptchaField
        ref="captcha"
        v-model="form.captchaAnswer"
        :purpose="replyingTo ? 'REPLY' : 'COMMENT'"
        @challenge="form.captchaChallengeId = $event"
      />
      <div class="community-composer__footer">
        <span>纯文本发布 · 请友善交流</span>
        <button class="button" type="submit" :disabled="isSubmitting || !form.captchaChallengeId">
          {{ isSubmitting ? '发布中…' : replyingTo ? '发布回复' : '发表评论' }}
        </button>
      </div>
      <p v-if="notice" class="community-notice" role="status">{{ notice }}</p>
      <p v-if="errorMessage" class="community-error" role="alert">{{ errorMessage }}</p>
    </form>

    <div v-if="isLoading" class="community-list-skeleton" aria-label="正在加载评论">
      <span v-for="item in 3" :key="item" />
    </div>
    <p v-else-if="!comments.length" class="community-empty">还没有评论，留下第一句吧。</p>
    <div v-else class="community-list">
      <article v-for="comment in comments" :key="comment.id" class="community-card">
        <header>
          <div>
            <strong>{{ comment.nickname }}</strong
            ><span>{{ formatDate(comment.createdAt) }}</span>
          </div>
          <span v-if="comment.authorType === 'ADMIN'" class="community-badge">博主</span>
        </header>
        <p>{{ comment.content }}</p>
        <button
          class="community-reply-link"
          type="button"
          @click="startReply(comment.id, comment.nickname)"
        >
          回复
        </button>
        <div v-if="comment.replies.length" class="community-replies">
          <div v-for="reply in comment.replies" :key="reply.id" class="community-reply">
            <header>
              <strong>{{ reply.nickname }}</strong
              ><span v-if="reply.authorType === 'ADMIN'" class="community-badge">博主</span
              ><time>{{ formatDate(reply.createdAt) }}</time>
            </header>
            <p>
              <span v-if="reply.replyToNickname" class="community-mention"
                >@{{ reply.replyToNickname }} </span
              >{{ reply.content }}
            </p>
            <button
              class="community-reply-link"
              type="button"
              @click="startReply(reply.id, reply.nickname)"
            >
              回复
            </button>
          </div>
        </div>
      </article>
      <button
        v-if="comments.length < total"
        class="community-load-more"
        type="button"
        :disabled="isLoadingMore"
        @click="loadMore"
      >
        {{ isLoadingMore ? '加载中…' : '加载更多' }}
      </button>
    </div>
  </section>
</template>
