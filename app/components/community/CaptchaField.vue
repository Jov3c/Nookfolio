<script setup lang="ts">
type CaptchaPurpose = 'COMMENT' | 'MESSAGE' | 'REPLY';

const props = defineProps<{ purpose: CaptchaPurpose }>();
const emit = defineEmits<{ challenge: [id: string] }>();
const answer = defineModel<string>({ required: true });
const image = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

async function refresh() {
  isLoading.value = true;
  errorMessage.value = '';
  answer.value = '';
  try {
    const response = await $fetch<{ data: { id: string; image: string } }>('/api/v1/public/captcha', {
      query: { purpose: props.purpose },
    });
    image.value = response.data.image;
    emit('challenge', response.data.id);
  } catch {
    image.value = '';
    emit('challenge', '');
    errorMessage.value = '验证码加载失败，请点击刷新。';
  } finally {
    isLoading.value = false;
  }
}

watch(() => props.purpose, refresh);
onMounted(refresh);
defineExpose({ refresh });
</script>

<template>
  <div class="captcha-field">
    <button class="captcha-field__image" type="button" aria-label="刷新验证码" @click="refresh">
      <img v-if="image" :src="image" alt="图片验证码" width="164" height="52" />
      <span v-else>{{ isLoading ? '加载中…' : '重新加载' }}</span>
    </button>
    <label>
      <span class="sr-only">验证码</span>
      <input
        v-model="answer"
        required
        minlength="4"
        maxlength="8"
        autocomplete="off"
        spellcheck="false"
        placeholder="输入图中字符"
      />
    </label>
    <button class="captcha-field__refresh" type="button" :disabled="isLoading" @click="refresh">
      刷新验证码
    </button>
    <span v-if="errorMessage" class="captcha-field__error" role="alert">{{ errorMessage }}</span>
  </div>
</template>
