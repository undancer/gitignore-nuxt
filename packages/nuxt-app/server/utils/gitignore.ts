// gitignore.io 核心逻辑 —— 遗留 Swift/Vapor 实现的 TypeScript 移植
// 遗留参考: legacy/gitignore.io/Sources/App/Controllers/TemplateController.swift
//          legacy/gitignore.io/Sources/App/RouteHandlers/APIRouteHandlers.swift
//          legacy/gitignore.io/Sources/App/Extensions/*
import type { H3Event } from 'h3'
import { queryCollection } from '@nuxt/content/server'

export interface IgnoreTemplateModel {
  key: string
  name: string
  fileName: string
  contents: string
}

export interface TemplateData {
  templates: Record<string, IgnoreTemplateModel>
  order: Record<string, number>
  count: number
}

let cached: TemplateData | null = null

// 加载模板数据：Nuxt Content 的 templates collection（content/templates，自定义 transformer 解析）
// .gitignore 主模板 → *.patch 追加 → *.stack 归并追加 → order 优先级
// 与 TemplateController.init 的三步加载（parseTemplateDirectory / patchTemplates / stackTempaltes）等价
export async function loadData(event: H3Event): Promise<TemplateData> {
  if (cached)
    return cached
  const items = await queryCollection(event, 'templates').all() as any[]

  // parseFile(orderFile) —— order 优先级，去注释/空行，按行号编号
  const order: Record<string, number> = {}
  // parseTemplateDirectory —— *.gitignore，CRLF 归一，contents 带 "### {name} ###" 头
  const templates: Record<string, IgnoreTemplateModel> = {}

  for (const item of items) {
    const { kind, name, stem, contents } = item
    if (kind === 'order') {
      contents
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map((line: string) => line.trim().toLowerCase())
        .filter((line: string) => !line.startsWith('#') && line !== '')
        .forEach((line: string, offset: number) => { order[line] = offset })
    }
    else if (kind === 'gitignore') {
      const key = stem.toLowerCase()
      templates[key] = {
        key,
        name: stem,
        fileName: name,
        contents: `\n### ${stem} ###\n${contents}`,
      }
    }
    else if (kind === 'patch') {
      // patchTemplates —— *.patch 追加到同名模板
      const target = templates[stem.toLowerCase()]
      if (target) {
        target.contents += `\n### ${stem} Patch ###\n${contents}`
      }
    }
    else if (kind === 'stack') {
      // stackTempaltes —— *.stack 按文件名点号第一部分归并（如 LAMP.PHP.stack → lamp）
      const stackKey = stem.split('.')[0].toLowerCase()
      const target = templates[stackKey]
      if (target) {
        target.contents += `\n### ${stem} Stack ###\n${contents}`
      }
    }
  }

  cached = { templates, order, count: Object.keys(templates).length }
  return cached
}

// 应用配置（来自 app/app.config.ts，构建时 env 覆盖）
export function getGitignoreConfig(): { hostOrigin: string, basePrefix: string } {
  const cfg = (useAppConfig() as any).gitignore ?? {}
  return {
    hostOrigin: (cfg.hostOrigin ?? 'https://www.toptal.com').trim().replace(/^\/+|\/+$/g, ''),
    basePrefix: (cfg.basePrefix ?? '').trim().replace(/^\/+|\/+$/g, ''),
  }
}

// 对应 UrlResolver.getCanonicalUrl()：HOST_ORIGIN（默认 toptal.com）+ BASE_PREFIX
export function getCanonicalUrl(): string {
  const { hostOrigin, basePrefix } = getGitignoreConfig()
  return basePrefix ? `${hostOrigin}/${basePrefix}` : hostOrigin
}

// 对应 UrlResolver.withBasePrefix()：路由前缀（basePrefix 空时原样返回）
export function withBasePrefix(route: string): string {
  const prefix = getGitignoreConfig().basePrefix
  return prefix ? `/${prefix}${route}` : route
}

// 对应 String.removeDuplicateLines()：删重复行，保留空行与 "# " 注释行
export function removeDuplicateLines(text: string): string {
  const seen = new Set<string>()
  return text.split('\n').filter((line) => {
    if (line === '' || line.startsWith('# '))
      return true
    if (seen.has(line))
      return false
    seen.add(line)
    return true
  }).join('\n')
}

// 对应 APIHandlers.createTemplate()：生成带头尾注释、按 order 排序、去重的 .gitignore 文本
export async function createIgnore(rawInput: string, event: H3Event): Promise<{ text: string, status: 200 | 404 | 500 }> {
  let urlDecoded: string
  try {
    urlDecoded = decodeURIComponent(rawInput)
  }
  catch {
    return { text: `\n#!! ERROR: url decoding ${rawInput} !#\n`, status: 500 }
  }

  const data = await loadData(event)
  const canonical = getCanonicalUrl()
  let status: 200 | 404 | 500 = 200

  // lowercased → 逗号拆分 → 去重(保首现) → 字母序 → order 优先级序
  const ordered = [...new Set(urlDecoded.toLowerCase().split(','))]
    .sort()
    .sort((a, b) => (data.order[a] ?? 0) - (data.order[b] ?? 0))

  const body = ordered.map((key) => {
    const template = data.templates[key]
    if (!template) {
      status = 404
      return `\n#!! ERROR: ${key} is undefined. Use list command to see defined gitignore types !!#\n`
    }
    return template.contents.replace(/Icon\r\n/g, 'Icon\r\r\n')
  }).join('')

  const header = `# Created by ${canonical}/api/${urlDecoded}\n# Edit at ${canonical}?templates=${urlDecoded}\n`
  const footer = `\n# End of ${canonical}/api/${urlDecoded}\n`
  return { text: removeDuplicateLines(header + body + footer), status }
}
