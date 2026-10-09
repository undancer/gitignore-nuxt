<script setup lang="ts">
// 应用外壳 —— 对齐官方 https://www.toptal.com/developers/gitignore/ 页面布局：
// 固定页头（AppHeader）+ 内容主体（NuxtPage）；官方页面无 footer/internal-linking，保持极简
</script>

<template>
  <NuxtRouteAnnouncer />
  <div class="page">
    <AppHeader />
    <main class="page__main">
      <NuxtPage />
    </main>
  </div>
</template>

<style scoped lang="scss">
// BEM：page 块；main 对齐 app.less（flex: 1 0 400px，768px+ 为 flex 容器）
.page {
  // 布局
  @apply
    flex
    flex-col
    min-h-screen;

  &__main {
    width: 100%;
    flex: 1 0 400px; // app.less main
    padding-top: 72px; // header 高度占位（app.less .content-wrapper）

    @media (min-width: 768px) {
      display: flex;
    }
  }
}
</style>
