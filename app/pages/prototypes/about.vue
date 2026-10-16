<script setup lang="ts">
definePageMeta({ layout: 'blog-prototype' });

useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] });

const variants = ['Field Notes', 'Editorial Story', 'Open Letter', 'Editorial Archive'];
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
        <main class="about-notes">
          <header class="about-notes__hero proto-enter">
            <div>
              <p class="eyebrow">FIELD NOTES / 2026</p>
              <h1>关于我与<br />一间数字书房</h1>
            </div>
            <p>一份仍在修改的自我介绍，也是一张关于 Nookfolio 的建站便笺。</p>
          </header>
          <section class="about-notes__sheet proto-enter proto-enter--delay">
            <aside class="about-notes__margin">
              <span>PROFILE</span><strong>01</strong>
              <p>成都<br />AI / 产品 / 工程</p>
            </aside>
            <article class="about-notes__copy">
              <h2>你好，我是 CCC。</h2>
              <p class="about-notes__lead">
                我喜欢把模糊的问题梳理清楚，再把它做成简单、可靠、能长期使用的产品。
              </p>
              <p>
                现在主要关注 AI
                应用、个人工具和产品工程。我相信好的技术不应该只停留在演示里，它还需要耐心、边界感和持续维护。
              </p>
              <blockquote>“做真正有用，也愿意长期留下来的东西。”</blockquote>
            </article>
            <aside class="about-notes__annotations">
              <p><b>正在做</b>Nookfolio<br />本地 AI 工作流</p>
              <p><b>工作方式</b>快速验证<br />长期迭代</p>
              <p><b>最近更新</b>2026.10</p>
            </aside>
          </section>
          <section
            class="about-notes__sheet about-notes__sheet--site proto-enter proto-enter--delay"
          >
            <aside class="about-notes__margin">
              <span>WEBSITE</span><strong>02</strong>
              <p>NOOKFOLIO<br />SINCE 2026</p>
            </aside>
            <article class="about-notes__copy">
              <h2>为什么还要做一个个人网站？</h2>
              <p class="about-notes__lead">因为有些内容值得拥有一个不被信息流打断的位置。</p>
              <p>
                Nookfolio
                用来保存文章、项目与个人档案。没有推荐算法，不追求更新频率，只希望每次打开时，它仍然清楚、安静，并且属于自己。
              </p>
            </article>
            <aside class="about-notes__annotations">
              <p><b>收录</b>文章 / 项目<br />简历 / 记录</p>
              <p><b>原则</b>真实<br />克制<br />可维护</p>
            </aside>
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

      <template v-else-if="current === 2">
        <main class="about-letter">
          <header class="about-letter__masthead proto-enter">
            <p>NOOKFOLIO</p>
            <span>一封公开信 · 2026</span>
          </header>
          <article class="about-letter__paper proto-enter proto-enter--delay">
            <p class="about-letter__salute">你好，欢迎来到这里。</p>
            <h1>这是一个关于<br /><em>好奇心、创造与长期主义</em>的网站。</h1>
            <div class="about-letter__body">
              <p>
                我是 CCC，一名在
                AI、产品与工程之间工作的创造者。我喜欢从一个还没有标准答案的问题开始，经过研究、试验和反复修改，最后把它变成真正能用的东西。
              </p>
              <p>
                Nookfolio
                是我留在网络上的一间书房。这里有已经完成的项目，也有尚未想清楚的笔记；有正式的个人档案，也有一些只想安静保存的想法。
              </p>
              <p>
                我不希望它成为一张静止的名片。它应该随着工作与生活慢慢变化，诚实地记录我曾经关注什么、做过什么，以及接下来准备去哪里。
              </p>
            </div>
            <footer>
              <div class="about-letter__signature">CCC</div>
              <p>写于成都<br />持续更新中</p>
            </footer>
          </article>
          <section class="about-letter__postscript proto-enter proto-enter--delay">
            <b>P.S.</b>
            <p>
              网站建立于 2026 年，主要收录博客、项目与个人简历。它由 Nuxt 与 PostgreSQL
              驱动，也由持续的好奇心维护。
            </p>
          </section>
        </main>
      </template>

      <template v-else>
        <main class="about-archive">
          <header class="about-archive__hero proto-enter">
            <div>
              <p class="eyebrow">EDITORIAL ARCHIVE</p>
              <h1>关于</h1>
            </div>
            <p>人物档案与站点记录<br />NO. 001 — 持续修订</p>
          </header>
          <section class="about-archive__record proto-enter proto-enter--delay">
            <div class="about-archive__number">01</div>
            <header>
              <span>PERSON / CCC</span>
              <h2>把复杂问题变成<br />清晰而可靠的产品。</h2>
            </header>
            <div class="about-archive__text">
              <p>
                关注 AI
                应用、产品工程与个人工具。喜欢研究新技术，但更在意它最终是否真正有用、是否能够被长期维护。
              </p>
              <dl>
                <div>
                  <dt>所在地</dt>
                  <dd>中国成都</dd>
                </div>
                <div>
                  <dt>当前方向</dt>
                  <dd>AI 产品与工作流</dd>
                </div>
                <div>
                  <dt>关键词</dt>
                  <dd>创造 / 交付 / 长期主义</dd>
                </div>
              </dl>
            </div>
          </section>
          <section class="about-archive__record proto-enter proto-enter--delay">
            <div class="about-archive__number">02</div>
            <header>
              <span>SITE / NOOKFOLIO</span>
              <h2>不依赖信息流的<br />个人数字档案。</h2>
            </header>
            <div class="about-archive__text">
              <p>
                用于保存文章、项目、个人经历和持续变化的兴趣。页面保持克制，内容掌握在自己手中，并允许一切慢慢生长。
              </p>
              <dl>
                <div>
                  <dt>建立</dt>
                  <dd>2026</dd>
                </div>
                <div>
                  <dt>技术</dt>
                  <dd>Nuxt / PostgreSQL</dd>
                </div>
                <div>
                  <dt>状态</dt>
                  <dd><i />持续维护</dd>
                </div>
              </dl>
            </div>
          </section>
          <footer class="about-archive__footer">
            <span>END OF RECORD</span>
            <nav>
              <a href="/blog">BLOG</a><a href="/projects">PROJECTS</a><a href="/about/cv">CV</a>
            </nav>
          </footer>
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
.about-notes {
  max-width: 1120px;
  margin: auto;
}
.about-notes__hero {
  display: grid;
  grid-template-columns: 1.5fr 0.5fr;
  align-items: end;
  min-height: 470px;
  padding: 70px 0;
  border-bottom: 1px solid var(--color-line);
}
.about-notes__hero h1 {
  margin: 15px 0 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(4rem, 7vw, 7rem);
  font-weight: 400;
  line-height: 0.96;
  letter-spacing: -0.06em;
}
.about-notes__hero > p {
  color: var(--color-muted);
  line-height: 1.75;
}
.about-notes__sheet {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr) 190px;
  gap: 50px;
  padding: 90px 0;
  border-bottom: 1px solid var(--color-line);
}
.about-notes__margin span,
.about-notes__annotations b {
  display: block;
  margin-bottom: 12px;
  color: var(--color-accent);
  font-size: 0.7rem;
  letter-spacing: 0.14em;
}
.about-notes__margin strong {
  display: block;
  font-family: Georgia, serif;
  font-size: 4.5rem;
  font-weight: 400;
  color: var(--color-line);
}
.about-notes__margin p,
.about-notes__annotations p {
  color: var(--color-muted);
  font-size: 0.76rem;
  line-height: 1.7;
}
.about-notes__copy h2 {
  margin: 0 0 32px;
  font-family: Georgia, serif;
  font-size: 2.8rem;
  font-weight: 400;
}
.about-notes__copy > p {
  max-width: 650px;
  color: var(--color-muted);
  font-size: 1.03rem;
  line-height: 1.9;
}
.about-notes__copy .about-notes__lead {
  color: var(--color-text);
  font-family: Georgia, serif;
  font-size: 1.55rem;
  line-height: 1.55;
}
.about-notes__copy blockquote {
  margin: 48px 0 0;
  padding: 22px 0 22px 28px;
  border-left: 2px solid var(--color-accent);
  font-family: Georgia, serif;
  font-size: 1.3rem;
}
.about-notes__annotations {
  border-left: 1px solid var(--color-line);
  padding-left: 25px;
}
.about-notes__annotations p {
  margin: 0 0 32px;
}
.about-letter {
  max-width: 1060px;
  margin: auto;
  padding-top: 55px;
}
.about-letter__masthead {
  display: flex;
  justify-content: space-between;
  padding: 18px 0;
  border-top: 3px solid var(--color-text);
  border-bottom: 1px solid var(--color-line);
  font-size: 0.75rem;
  letter-spacing: 0.14em;
}
.about-letter__masthead p {
  margin: 0;
  font-weight: 800;
}
.about-letter__masthead span {
  color: var(--color-muted);
}
.about-letter__paper {
  max-width: 850px;
  margin: auto;
  padding: 110px 30px 95px;
}
.about-letter__salute {
  margin-bottom: 42px;
  color: var(--color-accent);
  font-weight: 700;
}
.about-letter__paper h1 {
  margin: 0 0 70px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(3.2rem, 6vw, 6.5rem);
  font-weight: 400;
  line-height: 1.02;
  letter-spacing: -0.055em;
}
.about-letter__paper h1 em {
  color: var(--color-accent);
  font-weight: 400;
}
.about-letter__body {
  max-width: 680px;
  margin-left: auto;
}
.about-letter__body p {
  margin: 0 0 28px;
  color: var(--color-muted);
  font-family: Georgia, serif;
  font-size: 1.2rem;
  line-height: 1.95;
}
.about-letter__body p:first-child {
  color: var(--color-text);
  font-size: 1.42rem;
}
.about-letter__paper footer {
  display: flex;
  justify-content: flex-end;
  gap: 26px;
  align-items: end;
  margin-top: 65px;
}
.about-letter__signature {
  font-family: Georgia, serif;
  font-size: 2.5rem;
  font-style: italic;
}
.about-letter__paper footer p {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.75rem;
  line-height: 1.6;
}
.about-letter__postscript {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 25px;
  max-width: 850px;
  margin: auto;
  padding: 35px 30px;
  border-top: 1px solid var(--color-line);
}
.about-letter__postscript p {
  max-width: 650px;
  margin: 0;
  color: var(--color-muted);
  line-height: 1.8;
}
.about-archive {
  max-width: 1120px;
  margin: auto;
}
.about-archive__hero {
  display: flex;
  align-items: end;
  justify-content: space-between;
  min-height: 390px;
  padding: 70px 0;
  border-bottom: 1px solid var(--color-text);
}
.about-archive__hero h1 {
  margin: 10px 0 0;
  font-size: clamp(5rem, 10vw, 10rem);
  line-height: 0.78;
  letter-spacing: -0.08em;
}
.about-archive__hero > p {
  color: var(--color-muted);
  font-size: 0.75rem;
  line-height: 1.7;
  text-align: right;
}
.about-archive__record {
  display: grid;
  grid-template-columns: 110px 1fr 0.8fr;
  gap: 42px;
  padding: 75px 0;
  border-bottom: 1px solid var(--color-line);
}
.about-archive__number {
  font-family: Georgia, serif;
  font-size: 4.2rem;
  color: var(--color-line);
}
.about-archive__record header span {
  color: var(--color-accent);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
}
.about-archive__record h2 {
  margin: 26px 0 0;
  font-family: Georgia, serif;
  font-size: clamp(2.1rem, 4vw, 4rem);
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.04em;
}
.about-archive__text > p {
  margin: 42px 0;
  color: var(--color-muted);
  line-height: 1.85;
}
.about-archive__text dl div {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 11px 0;
  border-bottom: 1px solid var(--color-line);
  font-size: 0.82rem;
}
.about-archive__text dt {
  color: var(--color-muted);
}
.about-archive__text i {
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-right: 7px;
  border-radius: 50%;
  background: var(--color-accent);
}
.about-archive__footer {
  display: flex;
  justify-content: space-between;
  padding: 35px 0;
  color: var(--color-muted);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
}
.about-archive__footer nav {
  display: flex;
  gap: 25px;
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
  .about-notes__hero {
    display: block;
    min-height: 420px;
  }
  .about-notes__hero > p {
    margin-top: 45px;
  }
  .about-notes__sheet {
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 60px 0;
  }
  .about-notes__margin {
    display: flex;
    align-items: baseline;
    gap: 18px;
  }
  .about-notes__margin strong {
    font-size: 2.6rem;
  }
  .about-notes__annotations {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    border-left: 0;
    border-top: 1px solid var(--color-line);
    padding: 25px 0 0;
  }
  .about-letter__paper {
    padding: 75px 0;
  }
  .about-letter__body {
    margin-left: 0;
  }
  .about-letter__postscript {
    grid-template-columns: 1fr;
    padding-inline: 0;
  }
  .about-archive__hero {
    display: block;
    min-height: 340px;
  }
  .about-archive__hero > p {
    margin-top: 55px;
    text-align: left;
  }
  .about-archive__record {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  .about-archive__number {
    font-size: 2.7rem;
  }
  .about-archive__text > p {
    margin-top: 20px;
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
