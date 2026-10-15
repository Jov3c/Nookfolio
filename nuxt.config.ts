export default defineNuxtConfig({
  compatibilityDate: '2026-09-29',
  css: ['~/assets/css/base.css'],
  devtools: { enabled: false },
  modules: ['@nuxt/eslint'],
  app: {
    head: {
      script: [
        {
          innerHTML:
            "try{const t=localStorage.getItem('nookfolio-theme');if(t==='dark'||t==='light'){document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}}catch{}",
        },
      ],
    },
  },
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
