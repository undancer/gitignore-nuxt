<script setup lang="ts">
// 页头品牌栏 —— 对齐 legacy app.less header 区块：
// Toptal wordmark + gitignore.io 标题（semi-white 分隔线）+ 语言切换 + GitHub 链接
const { t, locale, locales, setLocale } = useI18n()
const { gitignore } = useAppConfig()
const asset = useAssetUrl()

const localeOptions = computed(() => (locales.value as Array<{ code: string, name?: string }>).map(l => ({ code: l.code, name: l.name ?? l.code })))

function onLocaleChange(code: string) {
  setLocale(code)
}
</script>

<template>
  <header class="site-header">
    <div class="site-header__container">
      <div class="site-header__left">
        <a :href="gitignore.developersUrl" aria-label="Toptal" title="Toptal">
          <img
            :src="asset('/img/toptal-logo-wordmark.svg')"
            width="100"
            height="30"
            alt="Toptal"
          >
        </a>
        <h1 class="site-header__title">
          gitignore.io
        </h1>
      </div>
      <div class="site-header__right">
        <select
          class="site-header__locale"
          :value="locale"
          aria-label="Language"
          @change="onLocaleChange(($event.target as HTMLSelectElement).value)"
        >
          <option v-for="l in localeOptions" :key="l.code" :value="l.code">
            {{ l.name }}
          </option>
        </select>
        <a
          :href="gitignore.sourceCodeUrl"
          :aria-label="t('sourceCodeTitle')"
          :title="t('sourceCodeTitle')"
          target="_blank"
          rel="noopener"
        >
          <img :src="asset('/img/github-logo.svg')" width="24" height="24" alt="GitHub">
        </a>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
// BEM：site-header 块；@apply 按分类多行使用；数值对齐 app.less
.site-header {
  // 视觉
  @apply
    bg-brand-blue
    text-brand-white;

  position: fixed;
  inset-inline: 0;
  top: 0;
  height: 72px;
  overflow-x: hidden;
  z-index: 1100;

  a {
    display: block;
    line-height: 0;
  }

  &__container {
    // 布局
    @apply
      flex
      items-center
      justify-between
      h-full
      mx-auto
      px-4;

    // app.less .container 响应式断点宽度
    @media (min-width: 1200px) {
      max-width: 1344px;
    }
  }

  &__left {
    // 布局
    @apply
      flex
      items-center
      px-2.5;

    a {
      padding-right: 16px;

      img {
        min-width: 100px;
        height: 30px;
      }
    }
  }

  &__title {
    margin: 0;
    font-size: 17px;
    line-height: 28px;
    border-left: 1px solid var(--colors-brand-semiWhite); // @logo-divider
    padding-left: 16px;
  }

  &__right {
    // 布局
    @apply
      flex
      items-center
      gap-4;

    @media (min-width: 1200px) {
      padding-right: 98px;
    }

    img {
      height: 24px;
    }
  }

  &__locale {
    padding: 4px 8px;
    font-size: 14px;
    border: 1px solid var(--colors-brand-lightgray);
    border-radius: 6px;
    background: var(--colors-brand-white);
    color: var(--colors-brand-black);
  }
}
</style>
