// 模板选择 store —— 使用 Pinia（@pinia/nuxt）+ VueUse（useLocalStorage 自动持久化）
import { defineStore } from 'pinia'

export const useTemplatesStore = defineStore('templates', () => {
  // useLocalStorage 持久化选中模板到 localStorage（VueUse），并作为 pinia setup store 的 state
  const selected = useLocalStorage<string[]>('gitignore:selected', [])

  const toggle = (id: string) => {
    const index = selected.value.indexOf(id)
    if (index >= 0)
      selected.value.splice(index, 1)
    else selected.value.push(id)
  }

  const files = computed(() => selected.value.join(','))

  return { selected, toggle, files }
})
