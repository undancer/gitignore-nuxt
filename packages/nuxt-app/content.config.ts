// Nuxt Content v3 collection 定义 —— gitignore 模板集合
// 模板文件（.gitignore/.patch/.stack/.txt(order)）由自定义 transformer 解析为结构化记录
// 查询方式（服务端）：queryCollection(event, 'templates')
import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    templates: defineCollection({
      type: 'data',
      source: 'templates/**',
      schema: z.object({
        // kind: template | patch | stack | order（由 .gitignore/.patch/.stack/.txt 扩展名判定）
        kind: z.string(),
        // 原文件名（含扩展名，如 Java.gitignore）
        name: z.string(),
        // 去扩展名文件名（如 Java、Android+reports、LAMP.PHP）
        stem: z.string(),
        // 文件内容（parse 前已完成 CRLF → LF 归一）
        contents: z.string(),
      }),
    }),
  },
})
