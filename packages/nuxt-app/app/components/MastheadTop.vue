<script setup lang="ts">
// 品牌区 —— masthead 顶部（logo + 副标题），样式对齐 app.less masthead-top
const { t } = useI18n()
const baseURL = useRuntimeConfig().app.baseURL.replace(/\/+$/, '')
</script>

<template>
  <div class="masthead-top">
    <img
      class="masthead-top__logo"
      :srcset="`${baseURL}/img/gitignore-logo-horizontal.png 370w, ${baseURL}/img/gitignore-logo-horizontal@2x.png 740w`"
      :src="`${baseURL}/img/gitignore-logo-horizontal.png`"
      width="370"
      height="50"
      sizes="(min-width: 960px) 740px, 100vw"
      alt="gitignore.io"
    >
    <h2 class="masthead-top__subtitle">
      {{ t('subtitle') }}
    </h2>
  </div>
</template>

<style scoped lang="scss">
// BEM：masthead-top 块；间距对齐 app.less masthead-top（120px / 桌面 180px / 320px 42px + 底部 25px）
.masthead-top {
  // 布局
  @apply
    flex
    flex-col
    items-center;

  margin-top: 120px;
  margin-bottom: 25px;

  @media (min-width: 768px) {
    margin-top: 180px;
  }

  @media (max-width: 320px) {
    margin-top: 42px;
  }

  &__logo {
    // 尺寸
    @apply
      w-full
      h-auto;

    max-width: 370px;
  }

  &__subtitle {
    margin: 20px 0;
    font-size: 16px;
    line-height: 16px;
    color: var(--colors-brand-darkgray); // @text-secondary
  }
}
</style>
