// gitignore.io 核心逻辑 —— 遗留 Swift/Vapor 实现的 TypeScript 移植
// 遗留参考: legacy/gitignore.io/Sources/App/Controllers/TemplateController.swift
//          legacy/gitignore.io/Sources/App/RouteHandlers/APIRouteHandlers.swift
//          legacy/gitignore.io/Sources/App/Extensions/*

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

async function asText(value: unknown): Promise<string> {
  return typeof value === 'string' ? value : String(value ?? '')
}

// 加载模板数据：*.gitignore 主模板 → *.patch 追加 → *.stack 归并追加 → order 优先级
// 与 TemplateController.init 的三步加载（parseTemplateDirectory / patchTemplates / stackTempaltes）等价
export async function loadData(): Promise<TemplateData> {
  if (cached) return cached
  // Nitro serverAssets 挂在 storage 的 assets 命名空间下（dev/build 一致）：
  // assets → templates(baseName) → 相对文件名
  const storage = useStorage('assets:templates')
  const keys = await storage.getKeys()

  // parseFile(orderFile) —— order 优先级，去注释/空行，按行号编号
  const order: Record<string, number> = {}
  const orderRaw = await asText(await storage.getItem('order'))
  orderRaw
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line.trim().toLowerCase())
    .filter(line => !line.startsWith('#') && line !== '')
    .forEach((line, offset) => { order[line] = offset })

  // parseTemplateDirectory —— *.gitignore，CRLF 归一，contents 带 "### {name} ###" 头
  const templates: Record<string, IgnoreTemplateModel> = {}
  for (const key of keys.filter(k => k.endsWith('.gitignore'))) {
    const fileName = key
    const name = fileName.slice(0, -'.gitignore'.length)
    const fileContents = (await asText(await storage.getItem(key))).replace(/\r\n/g, '\n')
    templates[name.toLowerCase()] = {
      key: name.toLowerCase(),
      name,
      fileName,
      contents: `\n### ${name} ###\n` + fileContents,
    }
  }

  // patchTemplates —— *.patch 追加到同名模板
  for (const key of keys.filter(k => k.endsWith('.patch'))) {
    const name = key.slice(0, -'.patch'.length)
    const target = templates[name.toLowerCase()]
    if (target) {
      target.contents += `\n### ${name} Patch ###\n` + await asText(await storage.getItem(key))
    }
  }

  // stackTempaltes —— *.stack 按文件名点号第一部分归并（如 LAMP.PHP.stack → lamp）
  for (const key of keys.filter(k => k.endsWith('.stack'))) {
    const name = key.slice(0, -'.stack'.length)
    const stackKey = name.split('.')[0].toLowerCase()
    const target = templates[stackKey]
    if (target) {
      target.contents += `\n### ${name} Stack ###\n` + await asText(await storage.getItem(key))
    }
  }

  cached = { templates, order, count: Object.keys(templates).length }
  return cached
}

// 对应 UrlResolver.getCanonicalUrl()：HOST_ORIGIN（默认 toptal.com）+ BASE_PREFIX
export function getCanonicalUrl(): string {
  const hostOrigin = (process.env.HOST_ORIGIN ?? 'https://www.toptal.com').trim().replace(/^\/+|\/+$/g, '')
  const prefix = process.env.BASE_PREFIX?.trim().replace(/^\/+|\/+$/g, '')
  return prefix ? `${hostOrigin}/${prefix}` : hostOrigin
}

// 对应 UrlResolver.withBasePrefix()
export function withBasePrefix(route: string): string {
  const prefix = process.env.BASE_PREFIX?.trim().replace(/^\/+|\/+$/g, '')
  return prefix ? `/${prefix}${route}` : route
}

// 对应 String.removeDuplicateLines()：删重复行，保留空行与 "# " 注释行
export function removeDuplicateLines(text: string): string {
  const seen = new Set<string>()
  return text.split('\n').filter((line) => {
    if (line === '' || line.startsWith('# ')) return true
    if (seen.has(line)) return false
    seen.add(line)
    return true
  }).join('\n')
}

// 对应 APIHandlers.createTemplate()：生成带头尾注释、按 order 排序、去重的 .gitignore 文本
export async function createIgnore(rawInput: string): Promise<{ text: string, status: 200 | 404 | 500 }> {
  let urlDecoded: string
  try {
    urlDecoded = decodeURIComponent(rawInput)
  } catch {
    return { text: `\n#!! ERROR: url decoding ${rawInput} !#\n`, status: 500 }
  }

  const data = await loadData()
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
