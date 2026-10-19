<script setup lang="ts">
import type { PublicMessage, PublicMessagesResponse } from '~/types/community';

const { nickname, email } = useVisitorIdentity();
const form = reactive({
  content: '',
  isPrivate: false,
  captchaChallengeId: '',
  captchaAnswer: '',
  website: '',
});
const messages = ref<PublicMessage[]>([]);
const page = ref(1);
const total = ref(0);
const snapshotAt = ref('');
const isLoading = ref(true);
const isLoadingMore = ref(false);
const isSubmitting = ref(false);
const notice = ref('');
const errorMessage = ref('');
const replyingTo = ref<{ id: string; nickname: string } | null>(null);
const captcha = ref<{ refresh: () => Promise<void> } | null>(null);

function mergeUniqueThreads(current: PublicMessage[], incoming: PublicMessage[]) {
  const known = new Set(current.map((item) => item.id));
  return [...current, ...incoming.filter((item) => !known.has(item.id))];
}

async function load(targetPage = 1) {
  if (targetPage === 1) snapshotAt.value = new Date().toISOString();
  const response = await $fetch<PublicMessagesResponse>('/api/v1/public/messages', {
    query: { page: targetPage, pageSize: 20, snapshotAt: snapshotAt.value },
  });
  messages.value =
    targetPage === 1 ? response.data : mergeUniqueThreads(messages.value, response.data);
  page.value = targetPage;
  total.value = response.meta.total;
}

onMounted(async () => {
  try {
    await load();
  } catch {
    errorMessage.value = '留言暂时无法加载。';
  } finally {
    isLoading.value = false;
  }
});

function formatDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Shanghai',
  })
    .format(new Date(value))
    .replaceAll('/', '-')
    .replace(',', '');
}

function startReply(id: string, targetNickname: string) {
  replyingTo.value = { id, nickname: targetNickname };
  form.isPrivate = false;
  notice.value = '';
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
  try {
    const endpoint = replyTarget
      ? `/api/v1/public/messages/${replyTarget.id}/replies`
      : '/api/v1/public/messages';
    await $fetch(endpoint, {
      method: 'POST',
      body: {
        nickname: nickname.value,
        email: email.value || undefined,
        content: form.content,
        isPrivate: form.isPrivate,
        captchaChallengeId: form.captchaChallengeId,
        captchaAnswer: form.captchaAnswer,
        website: form.website,
      },
    });
    const wasPrivate = form.isPrivate;
    form.content = '';
    form.isPrivate = false;
    replyingTo.value = null;
    notice.value = wasPrivate
      ? '悄悄话已送达，仅博主可见。'
      : replyTarget
        ? '回复已发布。'
        : '留言已发布。';
    if (!wasPrivate) await load();
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
  <section class="message-board" aria-labelledby="message-board-title">
    <form class="community-composer" @submit.prevent="submit">
      <div class="community-form__heading">
        <h2 id="message-board-title">写留言</h2>
        <span>验证后立即发布</span>
      </div>
      <div v-if="replyingTo" class="community-reply-target">
        回复 {{ replyingTo.nickname }}
        <button type="button" @click="replyingTo = null">取消</button>
      </div>
      <textarea
        v-model="form.content"
        required
        maxlength="4000"
        placeholder="有什么想说的？"
        aria-label="留言内容"
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
        :purpose="replyingTo ? 'REPLY' : 'MESSAGE'"
        @challenge="form.captchaChallengeId = $event"
      />
      <div class="community-composer__footer">
        <label v-if="!replyingTo" class="community-private"
          ><input v-model="form.isPrivate" type="checkbox" /> 悄悄话仅博主可见</label
        >
        <span v-else>纯文本发布 · 请友善交流</span>
        <button class="button" type="submit" :disabled="isSubmitting || !form.captchaChallengeId">
          {{ isSubmitting ? '发布中…' : replyingTo ? '发布回复' : '发布留言' }}
        </button>
      </div>
      <p v-if="notice" class="community-notice" role="status">{{ notice }}</p>
      <p v-if="errorMessage" class="community-error" role="alert">{{ errorMessage }}</p>
    </form>

    <section class="message-panel" aria-live="polite">
      <div class="community-section-heading message-panel__heading">
        <div><h2>留言</h2></div>
        <span>{{ total }} 条</span>
      </div>
      <div v-if="isLoading" class="community-list-skeleton" aria-label="正在加载留言">
        <span v-for="item in 3" :key="item" />
      </div>
      <p v-else-if="!messages.length" class="community-empty">还没有留言，欢迎留下第一句。</p>
      <div v-else class="community-list">
        <article v-for="message in messages" :key="message.id" class="community-card">
          <header>
            <div>
              <strong>{{ message.nickname }}</strong
              ><span>{{ formatDate(message.createdAt) }}</span>
            </div>
            <span v-if="message.authorType === 'ADMIN'" class="community-badge">博主</span>
          </header>
          <p>{{ message.content }}</p>
          <button
            class="community-reply-link"
            type="button"
            @click="startReply(message.id, message.nickname)"
          >
            回复
          </button>
          <div v-if="message.replies.length" class="community-replies">
            <div v-for="reply in message.replies" :key="reply.id" class="community-reply">
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
          v-if="messages.length < total"
          class="community-load-more"
          type="button"
          :disabled="isLoadingMore"
          @click="loadMore"
        >
          {{ isLoadingMore ? '加载中…' : '加载更多' }}
        </button>
      </div>
    </section>
  </section>
</template>
