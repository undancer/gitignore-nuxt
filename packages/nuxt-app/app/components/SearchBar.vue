<script setup lang="ts">
import { autoUpdate, offset, useFloating } from '@floating-ui/vue'
// 搜索栏 —— select2 式多选交互（对齐官方 https://www.toptal.com/developers/gitignore/ 与 legacy app.js）：
// - 已选模板以 tag 内嵌在输入框内，点击 tag 或 × 移除
// - 点选建议后搜索框清空、下拉浮层关闭
// - 空输入 Backspace 移除最后一个 tag；Enter 选择首个建议；Ctrl/Cmd+Enter 生成
// - Create 跳 /api/（官方仅一个"创建"按钮，对齐其布局）
// 浮层用 Floating UI 定位到输入框容器下方
import { storeToRefs } from 'pinia'

interface DropdownItem { id: string, text: string }

const { t } = useI18n()
const { gitignore } = useAppConfig()
const store = useTemplatesStore()
// storeToRefs：setup store 的 state/computed 必须经 storeToRefs 解构才保留 ref 形态；
// 直接解构会被 unwrap 成值，selected.value 为 undefined（此前导致 onKeydown 抛 TypeError）
const { selected, files } = storeToRefs(store)
const { toggle } = store

// 对齐 legacy app.js 的 BASE_PREFIX：去掉尾部斜杠，避免 baseURL='/' 时拼出 '//api/...'
const baseURL = useRuntimeConfig().app.baseURL.replace(/\/+$/, '')

const query = ref('')
const inputEl = ref<HTMLInputElement>()
const wrapRef = ref<HTMLElement>()
const { data: templateList } = await useFetch<DropdownItem[]>('/dropdown/templates.json')
const list = computed(() => templateList.value ?? [])

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
const suggestRef = ref<HTMLElement>()
const { floatingStyles } = useFloating(wrapRef, suggestRef, {
  placement: 'bottom-start',
  middleware: [offset(4)],
  whileElementsMounted: autoUpdate,
})

function focusInput() {
  inputEl.value?.focus()
}

// 点选建议：选中后清空搜索词，浮层随之关闭（v-if 依赖 query）
function pick(id: string) {
  toggle(id)
  query.value = ''
  focusInput()
}

// 对齐 app.js：Ctrl/Cmd+Enter 生成；Enter 添加当前第一个建议；空输入 Backspace 移除最后一个 tag
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault()
    create()
  }
  else if (e.key === 'Enter' && filtered.value.length > 0) {
    e.preventDefault()
    pick(filtered.value[0].id)
  }
  else if (e.key === 'Backspace' && query.value === '' && selected.value.length > 0) {
    e.preventDefault()
    toggle(selected.value[selected.value.length - 1])
  }
}

function create() {
  if (!files.value)
    return
  window.location.href = `${baseURL}/api/${files.value}`
}
</script>

<template>
  <div class="search">
    <div
      ref="wrapRef"
      class="search__wrap"
      role="combobox"
      :aria-expanded="query.length > 0"
      @click="focusInput"
    >
      <!-- placeholder 用 input 原生属性：无输入时显示、有输入即消失（不受已选 tag 影响） -->
      <span
        v-for="id in selected"
        :key="id"
        class="search__tag"
        :title="`Remove ${id}`"
        @click.stop="focusInput"
      >
        {{ id }}
        <span class="search__tag-remove" aria-hidden="true" role="button" :aria-label="`Remove ${id}`" @click.stop="toggle(id)">×</span>
      </span>
      <input
        ref="inputEl"
        v-model="query"
        type="text"
        class="search__input"
        autocomplete="off"
        spellcheck="false"
        :placeholder="t('searchPlaceholder')"
        :aria-label="t('searchPlaceholder')"
        @keydown="onKeydown"
      >
    </div>

    <div class="search__actions">
      <button class="search__btn search__btn--primary" type="button" @click="create">
        {{ t('searchGo') }}
      </button>
    </div>

    <ul
      v-if="query && filtered.length"
      ref="suggestRef"
      class="search__suggest"
      role="listbox"
      :style="floatingStyles"
    >
      <li
        v-for="item in filtered"
        :key="item.id"
        class="search__suggest-item"
        :class="{ 'search__suggest-item--picked': selected.includes(item.id) }"
        role="option"
        :aria-selected="selected.includes(item.id)"
        @click="pick(item.id)"
      >
        {{ item.text }}
        <span v-if="selected.includes(item.id)" class="search__suggest-check">✓</span>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
// BEM：search 块；@apply 按分类多行使用；数值对齐 variables.less
.search {
  // 布局
  @apply
    relative
    overflow-visible
    flex;

  gap: 8px;

  // 窄屏响应式（对齐 legacy select2-toptal-theme.less @767px 断点）：
  // 搜索框占满整行、按钮换行到下一行全宽，避免按钮被挤出视口不可见
  @media (max-width: 767px) {
    flex-direction: column;
    gap: 12px;

    &__wrap {
      flex: 1 1 100%;
      width: 100%;
    }

    &__actions {
      width: 100%;
    }

    &__btn {
      flex: 1;
      width: auto; // 覆盖 120px 固定宽，两个按钮平分一行
    }
  }

  &__wrap {
    // 布局
    @apply
      flex
      flex-wrap
      items-center
      gap-1
      flex-1
      min-w-0
      px-3
      py-1.5
      cursor-text;

    min-height: 46px; // @input-height（多行 tag 时自然增高）
    border: 1px solid var(--colors-brand-lightgray); // @input-border-color
    border-radius: 0;
    background: var(--colors-brand-white); // @input-bg

    &:focus-within {
      border-color: var(--colors-brand-blue); // @input-focus-border-color（对齐 select2-toptal-theme focus）
    }
  }

  &__tag {
    // 布局 + 视觉
    @apply
      inline-flex
      items-center
      gap-1
      px-2.5
      py-0.5
      rounded-full
      cursor-pointer;

    background-color: var(--colors-brand-semiWhite);
    color: var(--colors-brand-blue); // @tag-color
    border: 1px solid var(--colors-brand-lightgray); // @tag-border-color
    border-radius: 100px; // @tag-border-radius
    font-size: 14px;
    line-height: 1.4;
    user-select: none;
  }

  &__tag-remove {
    font-size: 15px;
    line-height: 1;
    color: var(--colors-brand-darkgray); // @tag-remove-color

    &:hover {
      color: var(--colors-brand-gray); // @tag-remove-color-hover
    }
  }

  &__input {
    // 布局
    @apply
      flex-1
      min-w-[80px];

    height: 28px;
    border: 0;
    outline: 0;
    padding: 0;
    font-size: 16px; // 窄屏（select2-toptal-theme 移动端 16px）
    background: transparent;
    color: var(--colors-brand-black);
    caret-color: var(--colors-brand-blue); // @input-caret-color

    @media (min-width: 768px) {
      font-size: 13px; // 桌面（select2-toptal-theme @media 768px 13px，对齐官方）
    }

    &::placeholder {
      color: var(--colors-brand-lightgray);
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

    width: 120px; // @button-width
    font-size: 14px; // 官方 btn-gitignore 14px
    line-height: 46px;
    border: 1px solid transparent;
    border-radius: 0;
    cursor: pointer;
  }

  &__btn--primary {
    background-color: var(--colors-brand-green); // @button-bg
    color: var(--colors-brand-white); // @button-text

    &:hover {
      background-color: var(--colors-brand-darkgreen); // @button-bg-hover
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
      p-0
      text-left;

    width: 100%; // 与输入框等宽（对齐 select2-dropdown 100%）
    max-height: 15em; // @dropdown-max-height
    border: 0; // @dropdown：border none（select2-toptal-theme）
    background: var(--colors-brand-white); // @dropdown-bg
    color: var(--colors-brand-black); // @dropdown-text-color
    font-size: 13px; // @dropdown 13px/16px
    line-height: 16px;
    box-shadow: 0 4px 8px rgb(0 0 0 / 0.08); // select2-toptal-theme dropdown shadow
  }

  &__suggest-item {
    // 布局
    @apply
      flex
      items-center
      justify-between
      cursor-pointer;

    padding: 10px; // .select2-results__option padding

    &:hover {
      background-color: rgb(32 78 207 / 0.08); // @option-highlighted-color
    }
  }

  &__suggest-item--picked {
    background-color: var(--colors-brand-lightgray); // @option-selected-color
    color: var(--colors-brand-darkBlue);
  }

  &__suggest-check {
    color: var(--colors-brand-blue);
    font-weight: 700;
  }
}
</style>
