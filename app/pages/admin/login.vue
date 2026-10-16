<script setup lang="ts">
definePageMeta({ layout: 'admin-auth' });

const route = useRoute();
const form = reactive({ email: '', password: '' });
const verification = reactive({ challengeToken: '', code: '', expiresAt: '' });
const step = ref<'credentials' | 'code'>('credentials');
const isHydrated = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref('');

useSeoMeta({ title: '管理员登录 — Nookfolio', robots: 'noindex, nofollow' });
onNuxtReady(() => {
  isHydrated.value = true;
});

async function submit() {
  isSubmitting.value = true;
  errorMessage.value = '';
  try {
    const response = await $fetch<{ data: { challengeToken: string; expiresAt: string } }>(
      '/api/v1/auth/login',
      {
        method: 'POST',
        body: form,
      },
    );
    verification.challengeToken = response.data.challengeToken;
    verification.expiresAt = response.data.expiresAt;
    step.value = 'code';
  } catch (error) {
    const fetchError = error as { statusCode?: number };
    errorMessage.value =
      fetchError.statusCode === 429
        ? '尝试次数过多，请稍后再试。'
        : '登录失败，请检查邮箱和密码，或稍后重试。';
  } finally {
    isSubmitting.value = false;
  }
}

async function verifyCode() {
  isSubmitting.value = true;
  errorMessage.value = '';
  try {
    await $fetch('/api/v1/auth/verify', {
      method: 'POST',
      body: { challengeToken: verification.challengeToken, code: verification.code },
    });
    const requested = typeof route.query.redirect === 'string' ? route.query.redirect : '/admin';
    const destination =
      requested.startsWith('/admin') && requested !== '/admin/login' ? requested : '/admin';
    window.location.assign(destination);
  } catch (error) {
    const fetchError = error as { statusCode?: number };
    errorMessage.value =
      fetchError.statusCode === 429 ? '尝试次数过多，请稍后再试。' : '验证码不正确或已经失效。';
  } finally {
    isSubmitting.value = false;
  }
}

async function resendCode() {
  isSubmitting.value = true;
  errorMessage.value = '';
  try {
    const response = await $fetch<{ data: { challengeToken: string; expiresAt: string } }>(
      '/api/v1/auth/resend',
      { method: 'POST', body: { challengeToken: verification.challengeToken } },
    );
    verification.challengeToken = response.data.challengeToken;
    verification.expiresAt = response.data.expiresAt;
    verification.code = '';
  } catch {
    errorMessage.value = '暂时无法重新发送验证码，请稍后再试。';
  } finally {
    isSubmitting.value = false;
  }
}

function resetLogin() {
  step.value = 'credentials';
  verification.challengeToken = '';
  verification.code = '';
  errorMessage.value = '';
}
</script>

<template>
  <main class="login-panel">
    <div class="login-panel__intro">
      <p class="eyebrow">Nookfolio 管理后台</p>
      <h1>欢迎回来</h1>
      <p>在一个安静、清晰的工作台中管理内容、资料和站点互动。</p>
    </div>

    <form @submit.prevent="step === 'credentials' ? submit() : verifyCode()">
      <label for="admin-email">邮箱</label>
      <input
        id="admin-email"
        v-model="form.email"
        type="email"
        autocomplete="username"
        :disabled="step === 'code'"
        required
      />
      <label for="admin-password">密码</label>
      <input
        id="admin-password"
        v-model="form.password"
        type="password"
        autocomplete="current-password"
        :disabled="step === 'code'"
        required
      />
      <p class="login-step-copy">
        {{
          step === 'code'
            ? '验证码已发送到管理员邮箱，请在 5 分钟内完成验证。'
            : '先获取验证码，再输入邮箱中收到的六位数字。'
        }}
      </p>
      <label for="admin-code">六位验证码</label>
      <input
        id="admin-code"
        v-model="verification.code"
        type="text"
        inputmode="numeric"
        autocomplete="one-time-code"
        pattern="[0-9]{6}"
        maxlength="6"
        :disabled="step !== 'code' || isSubmitting"
        :required="step === 'code'"
      />
      <p v-if="errorMessage" class="login-error" role="alert">{{ errorMessage }}</p>
      <button
        v-if="step === 'credentials'"
        class="button"
        type="submit"
        :disabled="!isHydrated || isSubmitting"
      >
        {{ isSubmitting ? '正在发送…' : '发送验证码' }}
      </button>
      <button
        v-else
        class="button"
        type="submit"
        :disabled="isSubmitting || verification.code.length !== 6"
      >
        {{ isSubmitting ? '正在验证…' : '验证并登录' }}
      </button>
      <div v-if="step === 'code'" class="login-code-actions">
        <button type="button" :disabled="isSubmitting" @click="resendCode">重新发送</button>
        <button type="button" @click="resetLogin">返回</button>
      </div>
    </form>
  </main>
</template>
