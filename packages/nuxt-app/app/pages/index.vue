<script setup lang="ts">
// gitignore.io 主页 —— 对齐遗留 index.leaf：masthead 顶部（logo + 副标题）、搜索栏（SearchBar）、
// 底部导航；交互逻辑均下沉到各组件（已选 tag 内嵌在搜索框内）
// i18n：17 种语言（对齐遗留 Localizations/）；SEO head 对齐遗留 index.leaf 的 meta 组

// --- SEO head（title/description/keywords/canonical/OG/Twitter）---
const { t } = useI18n()
const { data: templateList } = await useFetch<Array<{ id: string }>>('/dropdown/templates.json')
const list = computed(() => templateList.value ?? [])

const { gitignore } = useAppConfig()
const baseURL = useRuntimeConfig().app.baseURL.replace(/\/+$/, '')
const canonicalUrl = computed(() => {
  const { hostOrigin, basePrefix } = gitignore
  return basePrefix ? `${hostOrigin}/${basePrefix}` : hostOrigin
})
const description = computed(() => t('description', { templateCount: list.value.length }))
const ogImage = computed(() => `${canonicalUrl.value}/img/preview@2x.png`)
useHead(() => ({
  title: t('title'),
  meta: [
    { name: 'description', content: description.value },
    { name: 'keywords', content: 'gitignore,.gitignore,git,ignore,file,create,make,generate,build,automatic,programmatic,command line,cli' },
    // Open Graph / Twitter（对齐遗留 index.leaf 的社交分享 meta）
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: 'gitignore.io' },
    { property: 'og:description', content: description.value },
    { property: 'og:image', content: ogImage.value },
    { property: 'og:url', content: canonicalUrl.value },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:site', content: '@toptal' },
  ],
  link: [
    { rel: 'canonical', href: canonicalUrl.value },
    { rel: 'icon', href: `${baseURL}/favicon.ico`, type: 'image/x-icon' },
  ],
}))
</script>

<template>
  <div class="masthead">
    <MastheadTop />
    <SearchBar />
    <MastheadNav />
  </div>
</template>

<style scoped lang="scss">
// BEM：masthead 块 —— 仅保留页面容器布局；
// 品牌区（MastheadTop）与底部导航（MastheadNav）已拆为独立组件，样式随组件走
.masthead {
  // 布局
  @apply
    mx-auto
    text-center;

  max-width: 580px;
  overflow-y: auto;
  padding: 0 16px;
}
</style>
