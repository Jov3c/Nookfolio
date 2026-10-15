export default defineNuxtConfig({
  compatibilityDate: '2026-09-29',
  css: ['~/assets/css/base.css'],
  devtools: { enabled: false },
  modules: ['@nuxt/eslint'],
  runtimeConfig: {
    public: {
      siteUrl: process.env.PUBLIC_SITE_URL ?? 'https://site.example',
    },
  },
  ssr: true,
  typescript: {
    strict: true,
    typeCheck: true,
  },
});
