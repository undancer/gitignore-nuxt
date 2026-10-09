<script setup lang="ts">
// 应用外壳 —— 对齐遗留 index.leaf 的页面布局：固定页头（品牌栏 + GitHub + 语言切换）、
// 内容主体（NuxtPage）、internal-linking 跑马灯页脚
const { t, locale, locales, setLocale } = useI18n()
const { gitignore } = useAppConfig()
const asset = useAssetUrl()

const localeOptions = computed(() => (locales.value as Array<{ code: string, name?: string }>).map(l => ({ code: l.code, name: l.name ?? l.code })))
async function onLocaleChange(code: string) {
  await setLocale(code)
}
</script>

<template>
  <NuxtRouteAnnouncer />
  <div class="page">
    <header class="page__header">
      <div class="page__container">
        <div class="page__header-left">
          <a :href="gitignore.developersUrl" aria-label="Toptal" title="Toptal">
            <img
              :src="asset('/img/toptal-logo-wordmark.svg')"
              width="100"
              height="30"
              alt="Toptal"
            >
          </a>
          <h1 class="page__title">
            gitignore.io
          </h1>
        </div>
        <div class="page__header-right">
          <select
            class="page__locale"
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

    <main class="page__main">
      <NuxtPage />
    </main>

    <InternalLinking />
  </div>
</template>

<style scoped lang="scss">
// BEM：page 块；@apply 按分类多行使用
.page {
  // 布局
  @apply
    flex
    flex-col
    min-h-screen;

  &__header {
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

    max-width: 1344px;
  }

  &__header-left {
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
    border-left: 1px solid var(--colors-brand-semiWhite);
    padding-left: 16px;
  }

  &__header-right {
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

  &__main {
    // 布局
    @apply
      w-full
      flex-1;

    padding-top: 72px;
  }
}
</style>
