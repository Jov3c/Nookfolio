export default defineNuxtConfig({
  compatibilityDate: '2026-09-29',
  css: ['~/assets/css/base.css'],
  devtools: { enabled: false },
  modules: ['@nuxt/eslint'],
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/png', href: '/nookfolio-icon.png' },
        { rel: 'apple-touch-icon', href: '/nookfolio-icon.png' },
      ],
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
