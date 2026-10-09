<script setup lang="ts">
// 底部导航 —— masthead 底部链接（源码 / 命令行使用文档），样式对齐 app.less masthead-bottom
const { t } = useI18n()
const { gitignore } = useAppConfig()
</script>

<template>
  <nav class="masthead-nav">
    <ul class="masthead-nav__list">
      <li class="masthead-nav__item">
        <a
          class="masthead-nav__link"
          :href="gitignore.sourceCodeUrl"
          target="_blank"
          rel="noopener"
        >{{ t('sourceCodeTitle') }}</a>
      </li>
      <li class="masthead-nav__item">
        <a
          class="masthead-nav__link"
          :href="gitignore.commandLineDocsUrl"
          target="_blank"
          rel="noopener"
        >{{ t('commandLineTitle') }}</a>
      </li>
    </ul>
  </nav>
</template>

<style scoped lang="scss">
// BEM：masthead-nav 块；间距对齐 app.less masthead-bottom（40px + 60px）；
// 桌面（576px+）横向排列，链接间用 @nav-divider 竖线分隔，hover 下划线对齐 app.less
.masthead-nav {
  margin-top: 40px;
  margin-bottom: 60px;

  &__list {
    // 布局
    @apply
      flex
      flex-col
      justify-center
      list-none
      m-0
      p-0;

    @media (min-width: 576px) {
      flex-direction: row;
    }
  }

  &__item {
    margin-bottom: 16px;

    @media (min-width: 576px) {
      margin-bottom: 0;

      &:not(:first-child)::before {
        display: inline-block;
        content: '';
        width: 1px;
        height: 12px;
        background-color: var(--colors-brand-gray); // @nav-divider
        margin: 0 21px;
      }
    }
  }

  &__link {
    font-size: 16px;
    line-height: 16px;
    padding-bottom: 8px;

    &:hover,
    &:focus {
      text-decoration: none;
      border-bottom: 1px solid var(--colors-brand-blue); // @link
    }
  }
}
</style>
