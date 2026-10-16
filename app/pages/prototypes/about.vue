<script setup lang="ts">
definePageMeta({ layout: 'blog-prototype' });

useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] });

const variants = ['Quiet Profile', 'Editorial Story', 'Modular Index'];
const route = useRoute();
const router = useRouter();
const current = ref(Math.min(variants.length - 1, Math.max(0, Number(route.query.v || 1) - 1)));
const renderKey = ref(0);
const picker = ref<HTMLElement | null>(null);
const highlight = ref<HTMLElement | null>(null);

function moveHighlight() {
  const item = picker.value?.querySelectorAll<HTMLElement>(
    '.proto-picker-item:not(.proto-picker-replay)',
  )[current.value];
  if (!item || !highlight.value) return;
  highlight.value.style.width = `${item.offsetWidth}px`;
  highlight.value.style.transform = `translateX(${item.offsetLeft}px)`;
}

async function setActive(index: number) {
  if (index < 0 || index >= variants.length) return;
  current.value = index;
  renderKey.value += 1;
  await router.replace({ query: { ...route.query, v: String(index + 1) } });
  await nextTick();
  moveHighlight();
}

function replay() {
  renderKey.value += 1;
}

function handleKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement;
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable) return;
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  const number = Number.parseInt(event.key, 10);
  if (number >= 1 && number <= variants.length) setActive(number - 1);
  else if (event.key === 'ArrowRight') setActive((current.value + 1) % variants.length);
  else if (event.key === 'ArrowLeft')
    setActive((current.value - 1 + variants.length) % variants.length);
  else if (event.key.toLowerCase() === 'r') replay();
}

onMounted(() => {
  moveHighlight();
  requestAnimationFrame(() =>
    requestAnimationFrame(() => picker.value?.setAttribute('data-ready', '')),
  );
  window.addEventListener('resize', moveHighlight);
  document.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', moveHighlight);
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div class="about-prototype-root">
    <div :key="renderKey" class="page-container about-prototype-stage">
      <template v-if="current === 0">
        <header class="about-quiet__hero proto-enter">
          <p class="eyebrow">ABOUT</p>
          <h1>关于我，也关于<br />这个小小的网站。</h1>
          <p>这里收录我正在做的事、长期关注的问题，以及 Nookfolio 为什么存在。</p>
        </header>
        <main class="about-quiet proto-enter proto-enter--delay">
          <section class="about-quiet__portrait">
            <div class="about-monogram">C</div>
            <div>
              <small>PROFILE / 01</small>
              <h2>你好，我是 CCC。</h2>
            </div>
          </section>
          <section class="about-quiet__copy">
            <p class="about-lead">
              我关注 AI、产品与工程之间真正可用的连接，也喜欢把复杂的问题整理成可以长期维护的东西。
            </p>
            <p>
              这个网站是我的公开工作台。博客保存思考，项目记录实践，简历则整理一路走来的经验。内容会持续更新，但不会为了更新而更新。
            </p>
            <div class="about-facts">
              <span><small>现在关注</small>AI 产品与个人工具</span>
              <span><small>所在城市</small>中国成都</span>
              <span><small>工作方式</small>持续交付，长期维护</span>
            </div>
          </section>
          <section class="about-quiet__site">
            <div>
              <small>SITE / 02</small>
              <h2>关于 Nookfolio</h2>
            </div>
            <p>
              Nookfolio 是一个不依赖平台的信息角落。它尽量安静、清楚，并让所有内容都掌握在自己手中。
            </p>
            <dl>
              <div>
                <dt>建立于</dt>
                <dd>2026</dd>
              </div>
              <div>
                <dt>内容</dt>
                <dd>文章、项目、简历</dd>
              </div>
              <div>
                <dt>原则</dt>
                <dd>真实、克制、可维护</dd>
              </div>
            </dl>
          </section>
        </main>
      </template>

      <template v-else-if="current === 1">
        <main class="about-editorial">
          <header class="about-editorial__hero proto-enter">
            <p class="eyebrow">A PERSONAL NOTE</p>
            <h1>在网络上，<em>留一间自己的房间。</em></h1>
            <p class="about-editorial__dek">我是 CCC。这是我写作、创造和保存记忆的地方。</p>
          </header>
          <article class="about-editorial__story proto-enter proto-enter--delay">
            <aside>
              <span>01</span>
              <p>关于我</p>
            </aside>
            <div>
              <p class="dropcap">
                我喜欢从模糊的问题出发，慢慢把它变成一个清晰、可靠、能真正使用的产品。
              </p>
              <p>
                工作之外，我也在观察 AI
                如何改变创作与个人工作流。比起追逐每一次热闹，我更在意什么值得留下，以及怎样把它做得更好。
              </p>
            </div>
          </article>
          <blockquote class="about-editorial__quote proto-enter proto-enter--delay">
            “保持好奇，但不急着给所有问题一个答案。”
          </blockquote>
          <article
            class="about-editorial__story about-editorial__story--site proto-enter proto-enter--delay"
          >
            <aside>
              <span>02</span>
              <p>关于网站</p>
            </aside>
            <div>
              <h2>Nookfolio 是作品集，也是一本持续生长的笔记。</h2>
              <p>
                这里没有算法推荐，也不追求高频发布。每个页面都服务于一件简单的事：把项目、文章与个人经历放在一个可以长期维护的地方。
              </p>
              <ul>
                <li><span>Since</span>2026</li>
                <li><span>Built with</span>Nuxt / PostgreSQL</li>
                <li><span>Updated</span>持续更新</li>
              </ul>
            </div>
          </article>
        </main>
      </template>

      <template v-else>
        <main class="about-index">
          <header class="about-index__hero proto-enter">
            <div>
              <p class="eyebrow">ABOUT / INDEX</p>
              <h1>关于</h1>
            </div>
            <p>个人信息、当前状态与这个网站的简明索引。</p>
          </header>
          <section class="about-index__grid proto-enter proto-enter--delay">
            <article class="about-index__intro">
              <span>01 / PROFILE</span>
              <h2>CCC</h2>
              <p>AI 应用 · 产品工程 · 独立创造</p>
              <strong>把复杂问题做成简单、可靠、能够长期运行的产品。</strong>
            </article>
            <article>
              <span>02 / NOW</span>
              <h3>现在</h3>
              <p>研究本地 AI 工作流，完善 Nookfolio，并持续记录产品与工程实践。</p>
            </article>
            <article>
              <span>03 / FOCUS</span>
              <h3>关注</h3>
              <ul>
                <li>AI 与个人效率</li>
                <li>产品设计与工程实现</li>
                <li>可持续的独立项目</li>
              </ul>
            </article>
            <article class="about-index__wide">
              <span>04 / WEBSITE</span>
              <h3>Nookfolio</h3>
              <p>
                一个属于自己的数字角落，用来保存文章、项目、个人档案，以及那些不应该被信息流冲走的内容。
              </p>
              <dl>
                <div>
                  <dt>上线</dt>
                  <dd>2026</dd>
                </div>
                <div>
                  <dt>技术</dt>
                  <dd>Nuxt · PostgreSQL</dd>
                </div>
                <div>
                  <dt>状态</dt>
                  <dd><i />持续维护</dd>
                </div>
              </dl>
            </article>
            <article>
              <span>05 / LINKS</span>
              <h3>继续了解</h3>
              <nav>
                <a href="/projects">项目 ↗</a><a href="/blog">博客 ↗</a
                ><a href="/about/cv">个人简历 ↗</a>
              </nav>
            </article>
          </section>
        </main>
      </template>
    </div>

    <nav ref="picker" class="proto-picker" aria-label="Prototype variants">
      <span ref="highlight" class="proto-picker-highlight" aria-hidden="true" />
      <button
        v-for="(variant, index) in variants"
        :key="variant"
        class="proto-picker-item"
        :data-active="current === index || undefined"
        :aria-current="current === index ? 'true' : undefined"
        @click="setActive(index)"
      >
        {{ variant }}
      </button>
      <span class="proto-picker-divider" aria-hidden="true" />
      <button
        class="proto-picker-item proto-picker-replay"
        aria-label="Replay animation (R)"
        @click="replay"
      >
        ↻
      </button>
    </nav>
  </div>
</template>

<style scoped>
.about-prototype-stage {
  padding-top: 74px;
  padding-bottom: 130px;
}
.proto-enter {
  animation: proto-in 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
.proto-enter--delay {
  animation-delay: 80ms;
}
@keyframes proto-in {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.about-quiet__hero {
  max-width: 900px;
  padding: 70px 0 80px;
}
.about-quiet__hero h1 {
  max-width: 850px;
  margin: 14px 0 26px;
  font-size: clamp(3.5rem, 7vw, 7.8rem);
  line-height: 0.91;
  letter-spacing: -0.07em;
}
.about-quiet__hero > p:last-child {
  max-width: 580px;
  color: var(--color-muted);
  font-size: 1.15rem;
  line-height: 1.8;
}
.about-quiet {
  display: grid;
  grid-template-columns: minmax(230px, 0.7fr) 1.3fr;
  gap: 0;
  border-top: 1px solid var(--color-line);
}
.about-quiet > section {
  padding: 42px 34px;
  border-bottom: 1px solid var(--color-line);
}
.about-quiet__portrait {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 420px;
  border-right: 1px solid var(--color-line);
}
.about-monogram {
  display: grid;
  width: 94px;
  height: 94px;
  place-items: center;
  border: 1px solid var(--color-line);
  border-radius: 50%;
  font-size: 2.5rem;
  font-weight: 750;
}
.about-quiet small,
.about-index article > span {
  color: var(--color-accent);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.16em;
}
.about-quiet h2 {
  margin: 10px 0 0;
  font-size: 1.7rem;
}
.about-quiet__copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 22px;
}
.about-quiet__copy p,
.about-quiet__site > p {
  max-width: 720px;
  color: var(--color-muted);
  line-height: 1.85;
}
.about-quiet__copy .about-lead {
  color: var(--color-text);
  font-size: 1.45rem;
  line-height: 1.55;
}
.about-facts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-top: 12px;
}
.about-facts span {
  padding-top: 14px;
  border-top: 1px solid var(--color-line);
  font-size: 0.88rem;
}
.about-facts small {
  display: block;
  margin-bottom: 8px;
}
.about-quiet__site {
  grid-column: 1/-1;
  display: grid;
  grid-template-columns: 0.7fr 1fr 1fr;
  gap: 44px;
  align-items: start;
}
.about-quiet__site dl {
  margin: 0;
}
.about-quiet__site dl div {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-line);
}
.about-quiet__site dt {
  color: var(--color-muted);
}
.about-editorial {
  max-width: 1080px;
  margin: auto;
}
.about-editorial__hero {
  min-height: 600px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-bottom: 1px solid var(--color-line);
}
.about-editorial__hero h1 {
  max-width: 980px;
  margin: 18px 0 32px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(4rem, 8vw, 8.5rem);
  font-weight: 400;
  line-height: 0.93;
  letter-spacing: -0.065em;
}
.about-editorial__hero em {
  color: var(--color-accent);
  font-weight: 400;
}
.about-editorial__dek {
  font-size: 1.25rem;
  color: var(--color-muted);
}
.about-editorial__story {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 50px;
  padding: 100px 0;
  border-bottom: 1px solid var(--color-line);
}
.about-editorial__story aside span {
  font-family: Georgia, serif;
  font-size: 4rem;
  color: var(--color-line);
}
.about-editorial__story aside p {
  font-weight: 700;
}
.about-editorial__story > div > p {
  max-width: 700px;
  color: var(--color-muted);
  font-size: 1.08rem;
  line-height: 1.9;
}
.about-editorial__story .dropcap {
  color: var(--color-text);
  font-family: Georgia, serif;
  font-size: 1.8rem;
  line-height: 1.55;
}
.dropcap::first-letter {
  float: left;
  margin: 5px 10px 0 0;
  font-size: 4rem;
  line-height: 0.8;
}
.about-editorial__quote {
  margin: 0;
  padding: 110px 5%;
  border-bottom: 1px solid var(--color-line);
  font-family: Georgia, serif;
  font-size: clamp(2.2rem, 4.5vw, 4.8rem);
  font-weight: 400;
  line-height: 1.25;
  text-align: center;
}
.about-editorial__story h2 {
  max-width: 720px;
  font-family: Georgia, serif;
  font-size: 2.7rem;
  font-weight: 400;
  line-height: 1.25;
}
.about-editorial__story ul {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 32px 0 0;
  list-style: none;
}
.about-editorial__story li {
  padding-top: 14px;
  border-top: 1px solid var(--color-line);
}
.about-editorial__story li span {
  display: block;
  margin-bottom: 8px;
  color: var(--color-muted);
  font-size: 0.75rem;
  text-transform: uppercase;
}
.about-index__hero {
  display: flex;
  align-items: end;
  justify-content: space-between;
  min-height: 360px;
  padding: 70px 0;
  border-bottom: 1px solid var(--color-line);
}
.about-index__hero h1 {
  margin: 10px 0 0;
  font-size: clamp(5rem, 10vw, 10rem);
  line-height: 0.8;
  letter-spacing: -0.08em;
}
.about-index__hero > p {
  max-width: 340px;
  color: var(--color-muted);
  line-height: 1.7;
}
.about-index__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  padding-top: 14px;
}
.about-index article {
  min-height: 260px;
  padding: 28px;
  border: 1px solid var(--color-line);
  border-radius: var(--radius);
  background: var(--color-panel);
}
.about-index article h2 {
  margin: 42px 0 8px;
  font-size: 4rem;
  letter-spacing: -0.06em;
}
.about-index article h3 {
  margin: 36px 0 18px;
  font-size: 1.55rem;
}
.about-index article p,
.about-index article li {
  color: var(--color-muted);
  line-height: 1.7;
}
.about-index article ul {
  padding-left: 18px;
}
.about-index__intro {
  grid-column: span 2;
}
.about-index__intro strong {
  display: block;
  max-width: 660px;
  margin-top: 40px;
  font-size: 1.4rem;
  line-height: 1.55;
}
.about-index__wide {
  grid-column: span 2;
}
.about-index__wide dl {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-top: 35px;
}
.about-index__wide dl div {
  padding-top: 12px;
  border-top: 1px solid var(--color-line);
}
.about-index__wide dt {
  margin-bottom: 7px;
  color: var(--color-muted);
  font-size: 0.75rem;
}
.about-index__wide i {
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-right: 7px;
  border-radius: 50%;
  background: var(--color-accent);
}
.about-index nav {
  display: flex;
  flex-direction: column;
}
.about-index nav a {
  padding: 10px 0;
  border-bottom: 1px solid var(--color-line);
}
.proto-picker {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2147483647;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px;
  border-radius: 999px;
  background: rgba(10, 10, 10, 0.82);
  -webkit-backdrop-filter: blur(12px) saturate(1.4);
  backdrop-filter: blur(12px) saturate(1.4);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.08) inset,
    0 8px 24px rgba(0, 0, 0, 0.24),
    0 2px 6px rgba(0, 0, 0, 0.12);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 13px;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  user-select: none;
  -webkit-user-select: none;
}
.proto-picker-highlight {
  position: absolute;
  top: 4px;
  left: 0;
  height: 28px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  will-change: transform;
}
.proto-picker[data-ready] .proto-picker-highlight {
  transition:
    transform 250ms cubic-bezier(0.23, 1, 0.32, 1),
    width 250ms cubic-bezier(0.23, 1, 0.32, 1);
}
.proto-picker-item {
  position: relative;
  display: flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: rgba(255, 255, 255, 0.55);
  font: inherit;
  cursor: pointer;
  transition: color 150ms ease-out;
}
.proto-picker-item:hover {
  color: rgba(255, 255, 255, 0.85);
}
.proto-picker-item:active {
  transform: scale(0.97);
}
.proto-picker-item:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.4);
  outline-offset: 2px;
}
.proto-picker-item[data-active] {
  color: #fff;
}
.proto-picker-divider {
  width: 1px;
  height: 16px;
  margin: 0 4px;
  background: rgba(255, 255, 255, 0.12);
}
.proto-picker-replay {
  padding: 0 10px;
  font-size: 14px;
}
@media (max-width: 760px) {
  .about-prototype-stage {
    padding-top: 24px;
  }
  .about-quiet__hero {
    padding: 45px 0;
  }
  .about-quiet {
    grid-template-columns: 1fr;
  }
  .about-quiet__portrait {
    min-height: 300px;
    border-right: 0;
  }
  .about-quiet__site {
    grid-column: auto;
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .about-facts {
    grid-template-columns: 1fr;
  }
  .about-editorial__hero {
    min-height: 480px;
  }
  .about-editorial__story {
    grid-template-columns: 1fr;
    padding: 64px 0;
  }
  .about-editorial__story ul {
    grid-template-columns: 1fr;
  }
  .about-index__hero {
    display: block;
    min-height: 330px;
  }
  .about-index__hero > p {
    margin-top: 50px;
  }
  .about-index__grid {
    grid-template-columns: 1fr;
  }
  .about-index__intro,
  .about-index__wide {
    grid-column: auto;
  }
  .about-index__wide dl {
    grid-template-columns: 1fr;
  }
  .proto-picker {
    max-width: calc(100vw - 20px);
    overflow-x: auto;
  }
  .proto-picker-item {
    white-space: nowrap;
    padding: 0 9px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .proto-picker[data-ready] .proto-picker-highlight {
    transition: none;
  }
  .proto-enter {
    animation: none;
  }
}
</style>
