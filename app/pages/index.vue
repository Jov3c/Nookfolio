<script setup lang="ts">
import type { PublicHomeResponse } from '~/types/home';
import SiteBrand from '~/components/shell/SiteBrand.vue';
import ThemeToggle from '~/components/shell/ThemeToggle.vue';
import TravellingLink from '~/components/shell/TravellingLink.vue';

const { data: response, error } = await useFetch<PublicHomeResponse>('/api/v1/public/home', {
  key: 'public-home-page',
});
if (error.value || !response.value?.data) {
  throw createError({ statusCode: 503, statusMessage: 'Homepage is temporarily unavailable' });
}

const home = response.value.data;

definePageMeta({ layout: false });

usePageSeo(() => ({
  title: `${home.homeProfile.nickname} — ${home.homeProfile.role}`,
  description: home.siteProfile.siteDescription,
}));

function isExternalSocialUrl(url: string) {
  return /^(https?:|mailto:)/i.test(url);
}

function entryIconUrl(item: PublicHomeResponse['data']['entries'][number]) {
  if (item.iconMedia) return item.iconMedia.url;
  if (!item.icon) return null;
  if (item.icon.startsWith('/') && !item.icon.startsWith('//')) return item.icon;
  return /^https?:\/\//i.test(item.icon) ? item.icon : null;
}

function entryIconText(item: PublicHomeResponse['data']['entries'][number]) {
  if (!item.icon || entryIconUrl(item) || item.icon.includes('<')) return null;
  return item.icon;
}
</script>

<template>
  <div class="home-prototype">
    <section class="home-prototype__card" aria-label="Nookfolio 个人主页">
      <div class="home-prototype__grain" />
      <header class="home-prototype__topbar">
        <SiteBrand class="home-prototype__brand" :profile="home.siteProfile" />
        <div class="home-prototype__topbar-actions">
          <span
            v-if="home.homeProfile.statusVisible && home.homeProfile.statusText"
            class="home-prototype__status"
          >
            <i /> {{ home.homeProfile.statusText }}
          </span>
          <TravellingLink />
          <ThemeToggle />
        </div>
      </header>

      <main class="home-prototype__body">
        <div
          v-if="home.homeProfile.avatar"
          class="home-prototype__avatar home-prototype__avatar--image"
        >
          <img
            :src="home.homeProfile.avatar.url"
            :alt="home.homeProfile.avatar.altText || home.homeProfile.nickname"
          />
        </div>
        <div
          v-else
          class="home-prototype__avatar"
          :aria-label="`${home.homeProfile.nickname} 头像`"
        >
          J3
        </div>
        <h1>{{ home.homeProfile.nickname }}</h1>
        <p class="home-prototype__role">{{ home.homeProfile.role }}</p>
        <p class="home-prototype__intro">{{ home.homeProfile.intro }}</p>

        <nav class="home-prototype__grid" aria-label="站点入口">
          <template v-for="(item, index) in home.entries" :key="item.id">
            <NuxtLink
              v-if="item.targetType === 'INTERNAL'"
              :to="item.url"
              class="home-prototype__entry"
              :style="{ '--entry-index': index }"
              :target="item.openNewTab ? '_blank' : undefined"
              :rel="item.openNewTab ? 'noreferrer' : undefined"
            >
              <span class="home-prototype__entry-top">
                <span v-if="entryIconUrl(item)" class="home-prototype__entry-icon">
                  <img
                    :src="entryIconUrl(item)!"
                    :alt="item.iconMedia?.altText || ''"
                    loading="lazy"
                    referrerpolicy="no-referrer"
                  />
                </span>
                <b v-else-if="entryIconText(item)" aria-hidden="true">{{ entryIconText(item) }}</b>
                {{ item.title }}
              </span>
              <span>{{ item.description }}</span>
            </NuxtLink>
            <a
              v-else
              :href="item.url"
              class="home-prototype__entry"
              :style="{ '--entry-index': index }"
              :target="item.openNewTab ? '_blank' : undefined"
              :rel="item.openNewTab ? 'noreferrer' : undefined"
            >
              <span class="home-prototype__entry-top">
                <span v-if="entryIconUrl(item)" class="home-prototype__entry-icon">
                  <img
                    :src="entryIconUrl(item)!"
                    :alt="item.iconMedia?.altText || ''"
                    loading="lazy"
                    referrerpolicy="no-referrer"
                  />
                </span>
                <b v-else-if="entryIconText(item)" aria-hidden="true">{{ entryIconText(item) }}</b>
                {{ item.title }}
              </span>
              <span>{{ item.description }}</span>
            </a>
          </template>
        </nav>

        <div class="home-prototype__links" aria-label="外部链接">
          <template v-for="link in home.socialLinks" :key="link.id">
            <a
              v-if="isExternalSocialUrl(link.url)"
              :href="link.url"
              target="_blank"
              rel="noreferrer"
            >
              {{ link.name }}
            </a>
            <NuxtLink v-else :to="link.url">{{ link.name }}</NuxtLink>
          </template>
          <a
            v-if="home.siteProfile.publicContactEmail"
            :href="`mailto:${home.siteProfile.publicContactEmail}`"
            >Email</a
          >
          <NuxtLink to="/rss">RSS</NuxtLink>
        </div>
      </main>

      <footer class="home-prototype__footer">
        <span
          >© {{ new Date().getFullYear() }} {{ home.homeProfile.nickname }}. Built with
          curiosity.</span
        >
      </footer>
    </section>
  </div>
</template>

<style src="~/assets/css/public.css"></style>
