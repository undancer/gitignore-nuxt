<script setup lang="ts">
// gitignore.io 主页 —— 对齐遗留 index.leaf + src/js/app.js 的功能：
// 多选模板、?templates= 预选、Create 跳转 /api/、Download 跳转 /api/f/、Ctrl/Cmd+Enter 生成
interface DropdownItem { id: string, text: string }

const { data: templateList } = await useFetch<DropdownItem[]>('/dropdown/templates.json')
const selected = ref<string[]>([])
const query = ref('')
// 对齐遗留 app.js 的 BASE_PREFIX：去掉尾部斜杠，避免 baseURL='/' 时拼出 '//api/...' 被解析为协议相对 URL
const baseURL = useRuntimeConfig().app.baseURL.replace(/\/+$/, '')

const list = computed(() => templateList.value ?? [])

// 对齐遗留 index.leaf 的 SEO head（title/description/keywords/canonical）
const { public: { siteUrl } } = useRuntimeConfig()
useHead({
  title: 'gitignore.io - Create Useful .gitignore Files For Your Project',
  meta: [
    { name: 'description', content: `Create useful .gitignore files for your project by selecting from ${list.value.length} Operating System, IDE, and Programming Language .gitignore templates` },
    { name: 'keywords', content: 'gitignore,.gitignore,git,ignore,file,create,make,generate,build,automatic,programmatic,command line,cli' },
  ],
  link: [{ rel: 'canonical', href: siteUrl }],
})

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  const source = q ? list.value.filter(t => t.id.includes(q) || t.text.toLowerCase().includes(q)) : list.value
  return source.slice(0, 20)
})

// ?templates= 预选（只保留有效 id，对齐 app.js 的 validPreFilledSearchTerms）
const route = useRoute()
onMounted(() => {
  const pre = route.query.templates
  if (typeof pre === 'string' && pre) {
    const ids = list.value.map(t => t.id)
    selected.value = pre.replace(/\s/g, '+').toLowerCase().split(',').filter(t => ids.includes(t))
  }
})

const toggle = (id: string) => {
  const index = selected.value.indexOf(id)
  if (index >= 0) selected.value.splice(index, 1)
  else selected.value.push(id)
}

const files = computed(() => selected.value.join(','))

// 对齐 generateGitIgnore()：跳转 `${BASE_PREFIX}/api/${files}`
const create = () => {
  if (!files.value) return
  window.location.href = `${baseURL}/api/${files.value}`
}

// 对齐 generateGitIgnoreFile()：跳转 `${BASE_PREFIX}/api/f/${files}`
const download = () => {
  if (!files.value) return
  window.location.href = `${baseURL}/api/f/${files.value}`
}

// 对齐 app.js：Ctrl/Cmd+Enter 生成；单独 Enter 添加当前第一个建议
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault()
    create()
  } else if (e.key === 'Enter' && filtered.value.length > 0) {
    e.preventDefault()
    toggle(filtered.value[0].id)
  }
}
</script>

<template>
  <main class="container">
    <header class="header">
      <h1 class="logo">gitignore.io</h1>
      <nav class="nav">
        <a href="https://github.com/undancer/gitignore-nuxt" target="_blank" rel="noopener">Source Code</a>
        <a href="https://docs.gitignore.io/install/command-line" target="_blank" rel="noopener">Command Line Docs</a>
      </nav>
    </header>

    <section class="masthead">
      <p class="subtitle">Create useful .gitignore files for your project</p>

      <div class="search" role="combobox" aria-expanded="query.length > 0">
        <input
          v-model="query"
          type="search"
          class="search-input"
          placeholder="Search Operating Systems, IDEs, or Programming Languages"
          aria-label="Search templates"
          autocomplete="off"
          @keydown="onKeydown"
        >
        <button class="btn btn-primary" type="button" @click="create">Create</button>
        <button class="btn btn-secondary" type="button" @click="download">Download File</button>
      </div>

      <ul v-if="selected.length" class="chips" aria-label="Selected templates">
        <li v-for="id in selected" :key="id" class="chip" @click="toggle(id)" :title="`Remove ${id}`">
          {{ id }}<span class="chip-remove">×</span>
        </li>
      </ul>

      <ul v-if="query && filtered.length" class="suggest" role="listbox">
        <li
          v-for="t in filtered"
          :key="t.id"
          class="suggest-item"
          :class="{ picked: selected.includes(t.id) }"
          role="option"
          :aria-selected="selected.includes(t.id)"
          @click="toggle(t.id)"
        >
          {{ t.text }}
          <span v-if="selected.includes(t.id)" class="suggest-check">✓</span>
        </li>
      </ul>
    </section>

    <footer class="footer">
      {{ list.length }} Operating System, IDE, and Programming Language .gitignore templates
    </footer>
  </main>
</template>

<style scoped>
.container {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 1.25rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
}

.logo {
  margin: 0;
  font-size: 1.5rem;
  letter-spacing: -0.02em;
}

.nav {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
}

.nav a {
  color: #2563eb;
  text-decoration: none;
}

.nav a:hover {
  text-decoration: underline;
}

.masthead {
  margin-top: 3rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.subtitle {
  margin: 0;
  font-size: 1.125rem;
  color: #475569;
}

.search {
  display: flex;
  gap: 0.5rem;
  position: relative;
}

.search-input {
  flex: 1;
  min-width: 0;
  padding: 0.625rem 0.875rem;
  font-size: 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
}

.search-input:focus {
  outline: 2px solid #2563eb;
  outline-offset: 0;
}

.btn {
  padding: 0.625rem 1.125rem;
  font-size: 1rem;
  border-radius: 0.5rem;
  border: 1px solid transparent;
  cursor: pointer;
  white-space: nowrap;
}

.btn-primary {
  background: #2563eb;
  color: #fff;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.btn-secondary {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #cbd5e1;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.chips {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.6rem 0.3rem 0.75rem;
  background: #e0e7ff;
  color: #1e3a8a;
  border-radius: 999px;
  font-size: 0.875rem;
  cursor: pointer;
}

.chip-remove {
  font-size: 1.05rem;
  line-height: 1;
  color: #6366f1;
}

.suggest {
  list-style: none;
  margin: 0;
  padding: 0.375rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  background: #fff;
  max-height: 320px;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgb(15 23 42 / 0.08);
}

.suggest-item {
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  font-size: 0.9375rem;
}

.suggest-item:hover {
  background: #eff6ff;
}

.suggest-item.picked {
  background: #e0e7ff;
  color: #1e3a8a;
}

.suggest-check {
  color: #2563eb;
  font-weight: 700;
}

.footer {
  margin-top: auto;
  padding-top: 2rem;
  font-size: 0.8125rem;
  color: #64748b;
}
</style>
