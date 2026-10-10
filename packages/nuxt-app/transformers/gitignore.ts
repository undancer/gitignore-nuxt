// gitignore 模板自定义 transformer —— Nuxt Content v3
// 接管 .gitignore / .patch / .stack / .txt(order) 扩展名，保持模板文件原样（格式不变）
// 注册：nuxt.config.ts → content.build.transformers 引入本模块
import { defineTransformer } from '@nuxt/content'

const EXT_RE = /\.(gitignore|patch|stack|txt)$/

export default defineTransformer({
  name: 'gitignore',
  extensions: ['.gitignore', '.patch', '.stack', '.txt'],
  parse: async (file) => {
    // file.id 形如 'templates/Java.gitignore'、'templates/order.txt'
    const name = (file.id.split('/').pop() ?? file.id).replace(/^.*[\\/]/, '')
    const stem = name.replace(EXT_RE, '')
    const kind = name.endsWith('.txt') ? 'order' : (name.match(EXT_RE)?.[1] ?? '')
    return {
      id: file.id,
      kind,
      name,
      stem,
      contents: file.body,
    }
  },
})
