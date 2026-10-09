<script setup lang="ts">
// gitignore.io 主页 —— 对齐遗留 index.leaf + src/js/app.js 的功能：
// 多选模板、?templates= 预选、Create 跳转 /api/、Download 跳转 /api/f/、Ctrl/Cmd+Enter 生成
// i18n：17 种语言（对齐遗留 Localizations/），语言切换经 cookie 持久化
// 样式：scss scoped + BEM + UnoCSS @apply；搜索建议浮层用 Floating UI 定位；选中模板由 Pinia store 管理并持久化
import { autoUpdate, offset, useFloating } from '@floating-ui/vue'

interface DropdownItem { id: string, text: string }

const { data: templateList } = await useFetch<DropdownItem[]>('/dropdown/templates.json')
const query = ref('')
const store = useTemplatesStore()
const { selected, toggle, files } = store

// 对齐遗留 app.js 的 BASE_PREFIX：去掉尾部斜杠，避免 baseURL='/' 时拼出 '//api/...' 被解析为协议相对 URL
const baseURL = useRuntimeConfig().app.baseURL.replace(/\/+$/, '')

const list = computed(() => templateList.value ?? [])

// --- i18n ---
const { t } = useI18n()

// --- SEO head（对齐遗留 index.leaf：title/description/keywords/canonical/OG/Twitter）---
const { gitignore } = useAppConfig()
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

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  const source = q ? list.value.filter(t => t.id.includes(q) || t.text.toLowerCase().includes(q)) : list.value
  return source.slice(0, gitignore.suggestLimit)
})

// ?templates= 预选（只保留有效 id，对齐 app.js 的 validPreFilledSearchTerms）
const route = useRoute()
onMounted(() => {
  const pre = route.query.templates
  if (typeof pre === 'string' && pre) {
    const ids = list.value.map(t => t.id)
    const valid = pre.replace(/\s/g, '+').toLowerCase().split(',').filter(id => ids.includes(id))
    selected.value = valid
  }
})

// 搜索建议浮层定位（Floating UI）
const searchRef = ref<HTMLElement>()
const suggestRef = ref<HTMLElement>()
const { floatingStyles } = useFloating(searchRef, suggestRef, {
  placement: 'bottom-start',
  middleware: [offset(4)],
  whileElementsMounted: autoUpdate,
})

function create() {
  if (!files.value)
    return
  window.location.href = `${baseURL}/api/${files.value}`
}

function download() {
  if (!files.value)
    return
  window.location.href = `${baseURL}/api/f/${files.value}`
}

// 对齐 app.js：Ctrl/Cmd+Enter 生成；单独 Enter 添加当前第一个建议
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault()
    create()
  }
  else if (e.key === 'Enter' && filtered.value.length > 0) {
    e.preventDefault()
    toggle(filtered.value[0].id)
  }
}
</script>

<template>
  <div class="masthead">
    <div class="masthead__top">
      <img
        :srcset="`${baseURL}/img/gitignore-logo-horizontal.png 370w, ${baseURL}/img/gitignore-logo-horizontal@2x.png 740w`"
        :src="`${baseURL}/img/gitignore-logo-horizontal.png`"
        width="370"
        height="50"
        sizes="(min-width: 960px) 740px, 100vw"
        alt="gitignore.io"
      >
      <h2 class="masthead__subtitle">
        {{ t('subtitle') }}
      </h2>
    </div>

    <div ref="searchRef" class="masthead__search">
      <input
        v-model="query"
        type="search"
        class="masthead__input"
        :placeholder="t('searchPlaceholder')"
        :aria-label="t('searchPlaceholder')"
        autocomplete="off"
        role="combobox"
        aria-expanded="query.length > 0"
        @keydown="onKeydown"
      >
      <div class="masthead__actions">
        <button class="masthead__btn masthead__btn--primary" type="button" @click="create">
          {{ t('searchGo') }}
        </button>
        <button class="masthead__btn masthead__btn--secondary" type="button" @click="download">
          {{ t('searchDownload') }}
        </button>
      </div>

      <ul
        v-if="query && filtered.length"
        ref="suggestRef"
        class="masthead__suggest"
        role="listbox"
        :style="floatingStyles"
      >
        <li
          v-for="item in filtered"
          :key="item.id"
          class="masthead__suggest-item"
          :class="{ 'masthead__suggest-item--picked': selected.includes(item.id) }"
          role="option"
          :aria-selected="selected.includes(item.id)"
          @click="toggle(item.id)"
        >
          {{ item.text }}
          <span v-if="selected.includes(item.id)" class="masthead__suggest-check">✓</span>
        </li>
      </ul>
    </div>

    <ul v-if="selected.length" class="masthead__chips" aria-label="Selected templates">
      <li
        v-for="id in selected"
        :key="id"
        class="masthead__chip"
        :title="`Remove ${id}`"
        @click="toggle(id)"
      >
        {{ id }}<span class="masthead__chip-remove">×</span>
      </li>
    </ul>

    <nav class="masthead__nav">
      <a :href="gitignore.sourceCodeUrl" target="_blank" rel="noopener">{{ t('sourceCodeTitle') }}</a>
      <a :href="gitignore.commandLineDocsUrl" target="_blank" rel="noopener">{{ t('commandLineTitle') }}</a>
    </nav>

    <footer class="masthead__footer">
      {{ t('footer', { templateCount: list.length }) }}
    </footer>
  </div>
</template>

<style scoped lang="scss">
// BEM：masthead 块；@apply 按分类（布局/间距/视觉）多行使用
.masthead {
  // 布局
  @apply
    mx-auto
    text-center;

  max-width: 580px;
  overflow-y: auto;
  padding: 0 16px;

  &__top {
    // 布局
    @apply
      flex
      flex-col
      items-center
      mb-6;

    margin-top: 120px;

    @media (min-width: 768px) {
      margin-top: 180px;
    }

    @media (max-width: 320px) {
      margin-top: 42px;
    }

    img {
      // 尺寸
      @apply
        w-full
        h-auto;

      max-width: 370px;
    }
  }

  &__subtitle {
    margin: 20px 0;
    font-size: 16px;
    line-height: 16px;
    color: var(--colors-brand-darkgray);
  }

  &__search {
    // 布局
    @apply
      relative
      overflow-visible
      flex;

    gap: 8px;
  }

  &__input {
    // 布局
    @apply
      flex-1
      min-w-0;

    -webkit-appearance: none;
    height: 46px;
    line-height: 46px;
    border: 1px solid var(--colors-brand-lightgray);
    border-radius: 0;
    padding: 0 14px;
    font-size: 16px;

    &:focus {
      outline: 2px solid var(--colors-brand-blue);
      outline-offset: 0;
    }
  }

  &__actions {
    // 布局
    @apply
      flex
      gap-2
      shrink-0;
  }

  &__btn {
    // 尺寸 + 视觉
    @apply
      px-4
      h-[46px]
      whitespace-nowrap;

    font-size: 16px;
    line-height: 46px;
    border: 1px solid transparent;
    border-radius: 0;
    cursor: pointer;
  }

  &__btn--primary {
    background-color: var(--colors-brand-green);
    color: var(--colors-brand-white);

    &:hover {
      background-color: var(--colors-brand-darkgreen);
    }
  }

  &__btn--secondary {
    background-color: var(--colors-brand-semiWhite);
    color: var(--colors-brand-black);
    border-color: var(--colors-brand-lightgray);

    &:hover {
      background-color: var(--colors-brand-lightgray);
    }
  }

  &__suggest {
    // 布局
    @apply
      absolute
      z-20
      overflow-y-auto
      list-none
      m-0
      p-1.5
      text-left;

    width: min(100%, 480px);
    max-height: 320px;
    border: 1px solid var(--colors-brand-lightgray);
    border-radius: 6px;
    background: var(--colors-brand-white);
    box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);
  }

  &__suggest-item {
    // 布局
    @apply
      flex
      items-center
      justify-between
      px-3
      py-2
      rounded-md
      cursor-pointer;

    font-size: 15px;

    &:hover {
      background-color: rgb(32 78 207 / 0.08);
    }
  }

  &__suggest-item--picked {
    background-color: var(--colors-brand-lightgray);
    color: var(--colors-brand-darkBlue);
  }

  &__suggest-check {
    color: var(--colors-brand-blue);
    font-weight: 700;
  }

  &__chips {
    // 布局
    @apply
      flex
      flex-wrap
      justify-center
      gap-2
      list-none
      m-0
      p-0
      mt-4;
  }

  &__chip {
    // 布局 + 视觉
    @apply
      inline-flex
      items-center
      gap-1
      px-3
      py-0.5
      rounded-full
      cursor-pointer;

    background-color: var(--colors-brand-lightgray);
    color: var(--colors-brand-darkBlue);
    font-size: 14px;
  }

  &__chip-remove {
    font-size: 17px;
    line-height: 1;
    color: var(--colors-brand-darkgray);
  }

  &__nav {
    // 布局
    @apply
      flex
      flex-col
      items-center
      list-none
      m-0
      p-0
      mt-10
      mb-16;

    @media (min-width: 576px) {
      flex-direction: row;
      justify-content: center;
    }

    a {
      font-size: 16px;
      line-height: 16px;
      padding-bottom: 8px;
      margin-bottom: 16px;

      @media (min-width: 576px) {
        margin-bottom: 0;

        &:not(:first-child)::before {
          display: inline-block;
          content: '';
          width: 1px;
          height: 12px;
          background-color: var(--colors-brand-gray);
          margin: 0 21px;
        }
      }

      &:hover,
      &:focus {
        text-decoration: none;
        border-bottom: 1px solid var(--colors-brand-blue);
      }
    }
  }

  &__footer {
    // 排版
    @apply
      mt-auto
      pt-8
      pb-16;

    font-size: 13px;
    color: var(--colors-brand-darkgray);
  }
}
</style>
