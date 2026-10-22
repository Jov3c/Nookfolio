<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' });

interface SiteProfile {
  id: string;
  siteTitle: string;
  siteDescription: string;
  foundedAt: string;
  publicContactEmail: string | null;
  brandText: string;
  brandIconMediaId: string | null;
  brandIcon: { id: string; url: string; altText: string | null } | null;
}
interface HomeProfile {
  id: string;
  nickname: string;
  role: string;
  intro: string;
  avatarMediaId: string | null;
  avatar: { id: string; url: string; altText: string | null } | null;
  statusText: string | null;
  statusVisible: boolean;
}
interface HomeEntry {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  iconMediaId: string | null;
  iconMedia: { id: string; url: string; altText: string | null } | null;
  url: string;
  targetType: 'INTERNAL' | 'EXTERNAL';
  openNewTab: boolean;
  sortOrder: number;
  visible: boolean;
}
interface SocialLink {
  id: string;
  name: string;
  icon: string | null;
  url: string;
  sortOrder: number;
  visible: boolean;
}
interface MediaItem {
  id: string;
  originalName: string;
  publicUrl: string;
  altText: string | null;
}

const site = reactive<SiteProfile>({
  id: '',
  siteTitle: '',
  siteDescription: '',
  foundedAt: '',
  publicContactEmail: '',
  brandText: 'Nookfolio',
  brandIconMediaId: null,
  brandIcon: null,
});
const identity = reactive<HomeProfile>({
  id: '',
  nickname: '',
  role: '',
  intro: '',
  avatarMediaId: null,
  avatar: null,
  statusText: '',
  statusVisible: true,
});
const entries = ref<HomeEntry[]>([]);
const socialLinks = ref<SocialLink[]>([]);
const newEntry = reactive({
  title: '',
  description: '',
  icon: '↗',
  iconMediaId: null as string | null,
  url: '/',
  targetType: 'INTERNAL' as 'INTERNAL' | 'EXTERNAL',
  openNewTab: false,
  sortOrder: 50,
  visible: true,
});
const newSocial = reactive({ name: '', icon: '', url: 'https://', sortOrder: 30, visible: true });
const isLoading = ref(true);
const busyKey = ref('');
const notice = ref('');
const errorMessage = ref('');

useSeoMeta({ title: '首页资料 — Nookfolio 管理后台', robots: 'noindex, nofollow' });

async function load() {
  isLoading.value = true;
  try {
    const [siteResult, identityResult, entriesResult, socialsResult] = await Promise.all([
      $fetch<{ data: SiteProfile }>('/api/v1/admin/site-profile'),
      $fetch<{ data: HomeProfile }>('/api/v1/admin/home-profile'),
      $fetch<{ data: HomeEntry[] }>('/api/v1/admin/home-entries'),
      $fetch<{ data: SocialLink[] }>('/api/v1/admin/social-links'),
    ]);
    Object.assign(site, siteResult.data);
    Object.assign(identity, identityResult.data);
    entries.value = entriesResult.data;
    socialLinks.value = socialsResult.data;
  } catch {
    errorMessage.value = '首页配置加载失败，请刷新重试。';
  } finally {
    isLoading.value = false;
  }
}

async function saveSite() {
  await runAction('site', async () => {
    await $fetch('/api/v1/admin/site-profile', {
      method: 'PATCH',
      body: {
        siteTitle: site.siteTitle,
        siteDescription: site.siteDescription,
        foundedAt: site.foundedAt,
        publicContactEmail: site.publicContactEmail || null,
        brandText: site.brandText,
        brandIconMediaId: site.brandIconMediaId || null,
      },
    });
    await refreshNuxtData(['public-home-brand', 'public-home-meta', 'public-home-page']);
    notice.value = '站点信息已保存。';
  });
}

async function handleBrandUploaded(uploaded: MediaItem) {
  await runAction('brand-icon', async () => {
    site.brandIconMediaId = uploaded.id;
    site.brandIcon = { id: uploaded.id, url: uploaded.publicUrl, altText: uploaded.altText };
    await $fetch('/api/v1/admin/site-profile', {
      method: 'PATCH',
      body: {
        brandText: site.brandText,
        brandIconMediaId: uploaded.id,
      },
    });
    await refreshNuxtData(['public-home-brand', 'public-home-meta', 'public-home-page']);
    notice.value = '站点角标已上传并保存。';
  });
}

async function removeBrandIcon() {
  site.brandIconMediaId = null;
  site.brandIcon = null;
  await saveSite();
}

async function saveIdentity() {
  await runAction('identity', async () => {
    await $fetch('/api/v1/admin/home-profile', {
      method: 'PATCH',
      body: {
        nickname: identity.nickname,
        role: identity.role,
        intro: identity.intro,
        avatarMediaId: identity.avatarMediaId || null,
        statusText: identity.statusText || null,
        statusVisible: identity.statusVisible,
      },
    });
    notice.value = '首页 Identity 已保存。';
  });
}

async function handleAvatarUploaded(uploaded: MediaItem) {
  await runAction('avatar', async () => {
    identity.avatarMediaId = uploaded.id;
    identity.avatar = { id: uploaded.id, url: uploaded.publicUrl, altText: uploaded.altText };
    await $fetch('/api/v1/admin/home-profile', {
      method: 'PATCH',
      body: {
        nickname: identity.nickname,
        role: identity.role,
        intro: identity.intro,
        avatarMediaId: uploaded.id,
        statusText: identity.statusText || null,
        statusVisible: identity.statusVisible,
      },
    });
    notice.value = '头像已上传并保存。';
  });
}

async function removeAvatar() {
  identity.avatarMediaId = null;
  identity.avatar = null;
  await saveIdentity();
}

async function addEntry() {
  await runAction('new-entry', async () => {
    const result = await $fetch<{ data: HomeEntry }>('/api/v1/admin/home-entries', {
      method: 'POST',
      body: { ...newEntry },
    });
    entries.value = [...entries.value, result.data].sort(compareBySort);
    Object.assign(newEntry, {
      title: '',
      description: '',
      icon: '↗',
      iconMediaId: null,
      url: '/',
      targetType: 'INTERNAL',
      openNewTab: false,
      sortOrder: (entries.value.length + 1) * 10,
      visible: true,
    });
    notice.value = '首页入口已新增。';
  });
}

async function saveEntry(entry: HomeEntry) {
  await runAction('entry-' + entry.id, async () => {
    const result = await $fetch<{ data: HomeEntry }>(entryEndpoint(entry.id), {
      method: 'PATCH',
      body: {
        title: entry.title,
        description: entry.description,
        icon: entry.icon || null,
        iconMediaId: entry.icon ? null : entry.iconMediaId,
        url: entry.url,
        targetType: entry.targetType,
        openNewTab: entry.openNewTab,
        sortOrder: entry.sortOrder,
        visible: entry.visible,
      },
    });
    Object.assign(entry, result.data);
    notice.value = '入口「' + entry.title + '」已保存。';
  });
}

async function handleEntryIconUploaded(entry: HomeEntry, uploaded: MediaItem) {
  await runAction('entry-icon-' + entry.id, async () => {
    const updated = await $fetch<{ data: HomeEntry }>(entryEndpoint(entry.id), {
      method: 'PATCH',
      body: { icon: null, iconMediaId: uploaded.id },
    });
    Object.assign(entry, updated.data);
    notice.value = `入口「${entry.title}」的图标已上传并保存。`;
  });
}

async function clearEntryIcon(entry: HomeEntry) {
  entry.icon = null;
  entry.iconMediaId = null;
  entry.iconMedia = null;
  await saveEntry(entry);
}

function remoteEntryIconUrl(entry: Pick<HomeEntry, 'icon'>) {
  return entry.icon && /^https?:\/\//i.test(entry.icon) ? entry.icon : null;
}

function entryIconPreview(entry: HomeEntry) {
  return entry.iconMedia?.url || remoteEntryIconUrl(entry);
}

async function moveEntry(index: number, direction: -1 | 1) {
  const target = index + direction;
  if (target < 0 || target >= entries.value.length) return;
  const reordered = [...entries.value];
  [reordered[index], reordered[target]] = [reordered[target]!, reordered[index]!];
  await runAction('entry-order', async () => {
    await Promise.all(
      reordered.map((entry, position) =>
        $fetch(entryEndpoint(entry.id), {
          method: 'PATCH',
          body: { sortOrder: (position + 1) * 10 },
        }),
      ),
    );
    entries.value = reordered.map((entry, position) => ({
      ...entry,
      sortOrder: (position + 1) * 10,
    }));
    notice.value = '首页入口顺序已更新。';
  });
}

async function deleteEntry(entry: HomeEntry) {
  if (!window.confirm('确定删除「' + entry.title + '」吗？')) return;
  await runAction('delete-entry-' + entry.id, async () => {
    await $fetch(entryEndpoint(entry.id), { method: 'DELETE' });
    entries.value = entries.value.filter((item) => item.id !== entry.id);
    notice.value = '首页入口已删除。';
  });
}

async function addSocialLink() {
  await runAction('new-social', async () => {
    const result = await $fetch<{ data: SocialLink }>('/api/v1/admin/social-links', {
      method: 'POST',
      body: { ...newSocial, icon: newSocial.icon || null },
    });
    socialLinks.value = [...socialLinks.value, result.data].sort(compareBySort);
    Object.assign(newSocial, {
      name: '',
      icon: '',
      url: 'https://',
      sortOrder: (socialLinks.value.length + 1) * 10,
      visible: true,
    });
    notice.value = 'Social Link 已新增。';
  });
}

async function saveSocialLink(link: SocialLink) {
  await runAction('social-' + link.id, async () => {
    await $fetch(socialEndpoint(link.id), {
      method: 'PATCH',
      body: {
        name: link.name,
        icon: link.icon || null,
        url: link.url,
        sortOrder: link.sortOrder,
        visible: link.visible,
      },
    });
    notice.value = '链接「' + link.name + '」已保存。';
  });
}

async function moveSocial(index: number, direction: -1 | 1) {
  const target = index + direction;
  if (target < 0 || target >= socialLinks.value.length) return;
  const reordered = [...socialLinks.value];
  [reordered[index], reordered[target]] = [reordered[target]!, reordered[index]!];
  await runAction('social-order', async () => {
    await Promise.all(
      reordered.map((link, position) =>
        $fetch(socialEndpoint(link.id), {
          method: 'PATCH',
          body: { sortOrder: (position + 1) * 10 },
        }),
      ),
    );
    socialLinks.value = reordered.map((link, position) => ({
      ...link,
      sortOrder: (position + 1) * 10,
    }));
    notice.value = 'Social Links 顺序已更新。';
  });
}

async function deleteSocialLink(link: SocialLink) {
  if (!window.confirm('确定删除「' + link.name + '」吗？')) return;
  await runAction('delete-social-' + link.id, async () => {
    await $fetch(socialEndpoint(link.id), { method: 'DELETE' });
    socialLinks.value = socialLinks.value.filter((item) => item.id !== link.id);
    notice.value = 'Social Link 已删除。';
  });
}

async function runAction(key: string, action: () => Promise<void>) {
  busyKey.value = key;
  notice.value = '';
  errorMessage.value = '';
  try {
    await action();
  } catch (error) {
    const fetchError = error as { data?: { error?: { message?: string } } };
    errorMessage.value = fetchError.data?.error?.message || '保存失败，请检查字段后重试。';
  } finally {
    busyKey.value = '';
  }
}

function entryEndpoint(id: string) {
  return '/api/v1/admin/home-entries/' + id;
}
function socialEndpoint(id: string) {
  return '/api/v1/admin/social-links/' + id;
}
function compareBySort(left: { sortOrder: number }, right: { sortOrder: number }) {
  return left.sortOrder - right.sortOrder;
}

onMounted(load);
</script>

<template>
  <div class="home-admin">
    <header class="admin-page-heading">
      <div>
        <p>资料管理 / 首页</p>
        <h1>首页资料</h1>
      </div>
      <span>内容可配置，页面设计保持不变</span>
    </header>

    <p v-if="isLoading" class="media-empty">正在加载首页配置…</p>
    <template v-else>
      <AdminNotice :message="notice" />
      <p v-if="errorMessage" class="admin-error" role="alert">{{ errorMessage }}</p>

      <section class="home-admin-section">
        <div class="home-admin-section__heading">
          <div>
            <p class="eyebrow">站点资料</p>
            <h2>设置网站的基本信息</h2>
          </div>
          <span>SEO 与公开联系方式</span>
        </div>
        <form class="home-form-grid" @submit.prevent="saveSite">
          <label
            ><span>站点标题</span><input v-model="site.siteTitle" maxlength="120" required
          /></label>
          <label
            ><span>建站日期</span><input v-model="site.foundedAt" type="date" required
          /></label>
          <label class="home-form-grid__wide"
            ><span>站点描述</span
            ><textarea v-model="site.siteDescription" rows="2" maxlength="300" required />
          </label>
          <label
            ><span>公开联系邮箱</span
            ><input v-model="site.publicContactEmail" type="email" placeholder="公开邮箱（可选）"
          /></label>
          <label
            ><span>角标文字</span><input v-model="site.brandText" maxlength="80" required
          /></label>
          <AdminDirectImageUpload
            class="home-form-grid__wide"
            label="站点角标"
            category="icons"
            :current-url="site.brandIcon?.url"
            :fallback-text="site.brandText"
            :alt-text="`${site.brandText} 站点角标`"
            :disabled="busyKey === 'brand-icon'"
            @uploaded="handleBrandUploaded"
            @removed="removeBrandIcon"
            @error="errorMessage = $event"
          />
          <button class="button" type="submit" :disabled="busyKey === 'site'">保存站点资料</button>
        </form>
      </section>

      <section class="home-admin-section">
        <div class="home-admin-section__heading">
          <div>
            <p class="eyebrow">个人身份</p>
            <h2>设置访客看到的第一印象</h2>
          </div>
          <span>头像上传后直接绑定</span>
        </div>
        <form class="home-form-grid" @submit.prevent="saveIdentity">
          <label
            ><span>昵称</span><input v-model="identity.nickname" maxlength="80" required
          /></label>
          <label
            ><span>身份 / 标题</span><input v-model="identity.role" maxlength="160" required
          /></label>
          <label class="home-form-grid__wide"
            ><span>简介</span
            ><textarea v-model="identity.intro" rows="4" maxlength="2000" required />
          </label>
          <AdminDirectImageUpload
            class="home-form-grid__wide"
            label="个人头像"
            category="avatars"
            crop="square"
            :current-url="identity.avatar?.url"
            :fallback-text="identity.nickname || 'J3'"
            :alt-text="`${identity.nickname} 头像`"
            :disabled="busyKey === 'avatar'"
            @uploaded="handleAvatarUploaded"
            @removed="removeAvatar"
            @error="errorMessage = $event"
          />
          <label
            ><span>状态文字</span
            ><input v-model="identity.statusText" maxlength="120" placeholder="最近正在做什么"
          /></label>
          <label class="home-checkbox"
            ><input v-model="identity.statusVisible" type="checkbox" /><span
              >在公开首页显示状态</span
            ></label
          >
          <button class="button" type="submit" :disabled="busyKey === 'identity'">
            保存个人身份
          </button>
        </form>
      </section>

      <section class="home-admin-section">
        <div class="home-admin-section__heading">
          <div>
            <p class="eyebrow">首页入口</p>
            <h2>管理首页中的功能入口</h2>
          </div>
          <span
            >已展示 {{ entries.filter((entry) => entry.visible).length }} 个 · 最多公开 8 个</span
          >
        </div>
        <div class="home-entry-list">
          <article v-for="(entry, index) in entries" :key="entry.id" class="home-entry-editor">
            <div class="home-entry-editor__order">
              <button
                type="button"
                :disabled="index === 0 || busyKey === 'entry-order'"
                @click="moveEntry(index, -1)"
              >
                ↑</button
              ><span>{{ String(index + 1).padStart(2, '0') }}</span
              ><button
                type="button"
                :disabled="index === entries.length - 1 || busyKey === 'entry-order'"
                @click="moveEntry(index, 1)"
              >
                ↓
              </button>
            </div>
            <div class="home-entry-editor__fields">
              <label><span>标题</span><input v-model="entry.title" maxlength="80" /></label>
              <label><span>描述</span><input v-model="entry.description" maxlength="180" /></label>
              <AdminDirectImageUpload
                label="入口图标"
                category="icons"
                compact
                :current-url="entryIconPreview(entry)"
                :fallback-text="entry.icon || entry.title"
                :alt-text="`${entry.title} 图标`"
                :disabled="busyKey === 'entry-icon-' + entry.id"
                @uploaded="handleEntryIconUploaded(entry, $event)"
                @removed="clearEntryIcon(entry)"
                @error="errorMessage = $event"
              />
              <label><span>地址</span><input v-model="entry.url" maxlength="500" /></label>
              <label
                ><span>类型</span
                ><select v-model="entry.targetType">
                  <option value="INTERNAL">站内链接</option>
                  <option value="EXTERNAL">外部链接</option>
                </select></label
              >
              <label
                ><span>排序</span><input v-model.number="entry.sortOrder" type="number" min="0"
              /></label>
              <label class="home-checkbox"
                ><input v-model="entry.visible" type="checkbox" /><span>显示</span></label
              >
              <label class="home-checkbox"
                ><input v-model="entry.openNewTab" type="checkbox" /><span
                  >在新标签页打开</span
                ></label
              >
            </div>
            <div class="home-entry-editor__actions">
              <button
                class="admin-secondary-button"
                type="button"
                :disabled="busyKey === 'entry-' + entry.id"
                @click="saveEntry(entry)"
              >
                保存</button
              ><button class="admin-danger-button" type="button" @click="deleteEntry(entry)">
                删除
              </button>
            </div>
          </article>
        </div>
        <form class="home-new-entry" @submit.prevent="addEntry">
          <strong>添加入口</strong>
          <div class="home-entry-editor__fields">
            <label
              ><span>标题</span><input v-model="newEntry.title" maxlength="80" required /></label
            ><label
              ><span>描述</span
              ><input v-model="newEntry.description" maxlength="180" required /></label
            ><label
              ><span>图标链接 / 字符</span
              ><input
                v-model="newEntry.icon"
                maxlength="500"
                placeholder="https://... 或 Emoji，创建后可上传" /></label
            ><label
              ><span>地址</span><input v-model="newEntry.url" maxlength="500" required /></label
            ><label
              ><span>类型</span
              ><select v-model="newEntry.targetType">
                <option value="INTERNAL">站内链接</option>
                <option value="EXTERNAL">外部链接</option>
              </select></label
            ><label
              ><span>排序</span><input v-model.number="newEntry.sortOrder" type="number" min="0"
            /></label>
          </div>
          <button class="button" type="submit" :disabled="busyKey === 'new-entry'">添加入口</button>
        </form>
      </section>

      <section id="social-links" class="home-admin-section">
        <div class="home-admin-section__heading">
          <div>
            <p class="eyebrow">社交链接</p>
            <h2>维护公开的社交入口</h2>
          </div>
          <span>GitHub、邮箱、RSS 与其他地址</span>
        </div>
        <div class="social-link-list">
          <article v-for="(link, index) in socialLinks" :key="link.id" class="social-link-editor">
            <div class="home-entry-editor__order">
              <button
                type="button"
                :disabled="index === 0 || busyKey === 'social-order'"
                @click="moveSocial(index, -1)"
              >
                ↑</button
              ><span>{{ String(index + 1).padStart(2, '0') }}</span
              ><button
                type="button"
                :disabled="index === socialLinks.length - 1 || busyKey === 'social-order'"
                @click="moveSocial(index, 1)"
              >
                ↓
              </button>
            </div>
            <div class="social-link-editor__fields">
              <label><span>名称</span><input v-model="link.name" maxlength="80" /></label
              ><label><span>图标</span><input v-model="link.icon" maxlength="80" /></label
              ><label><span>地址</span><input v-model="link.url" maxlength="500" /></label
              ><label
                ><span>排序</span
                ><input v-model.number="link.sortOrder" type="number" min="0" /></label
              ><label class="home-checkbox"
                ><input v-model="link.visible" type="checkbox" /><span>显示</span></label
              >
            </div>
            <div class="home-entry-editor__actions">
              <button class="admin-secondary-button" type="button" @click="saveSocialLink(link)">
                保存</button
              ><button class="admin-danger-button" type="button" @click="deleteSocialLink(link)">
                删除
              </button>
            </div>
          </article>
        </div>
        <form class="home-new-entry" @submit.prevent="addSocialLink">
          <strong>添加社交链接</strong>
          <div class="social-link-editor__fields">
            <label
              ><span>名称</span><input v-model="newSocial.name" maxlength="80" required /></label
            ><label><span>图标</span><input v-model="newSocial.icon" maxlength="80" /></label
            ><label
              ><span>地址</span><input v-model="newSocial.url" maxlength="500" required /></label
            ><label
              ><span>排序</span><input v-model.number="newSocial.sortOrder" type="number" min="0"
            /></label>
          </div>
          <button class="button" type="submit" :disabled="busyKey === 'new-social'">
            添加社交链接
          </button>
        </form>
      </section>
    </template>
  </div>
</template>
