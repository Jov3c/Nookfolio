export default defineNuxtConfig({
  compatibilityDate: '2026-09-29',
  css: ['~/assets/css/base.css', '~/assets/css/markdown.css'],
  devtools: { enabled: false },
  modules: ['@nuxt/eslint'],
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
      meta: [{ name: 'theme-color', content: '#EA632B' }],
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
