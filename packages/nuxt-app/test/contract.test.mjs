import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
// 契约回归测试：对齐遗留系统（legacy/gitignore.io）的 API 与页面行为
// 用法：
//   pnpm --filter nuxt-app test:contract          # build + 无前缀模式（+ 前缀模式）全部断言
//   node test/contract.test.mjs                   # 连已运行的 server（BASE_URL 指向它），无前缀断言
//   node test/contract.test.mjs --prefix          # 连已运行的 server，前缀模式断言（server 需以 BASE_PREFIX=testprefix 启动）
// 自动模式：未设置 BASE_URL 时，spawn .output/server/index.mjs（PORT=3100 / 3101）
import { after, before, it } from 'node:test'

const APP_ROOT = fileURLToPath(new URL('..', import.meta.url))

const PREFIX_MODE = process.env.PREFIX_MODE === '1' || process.argv.includes('--prefix')
const PREFIX = 'testprefix'
const PORT = PREFIX_MODE ? 3101 : 3100
const BASE_URL = process.env.BASE_URL || `http://127.0.0.1:${PORT}`
const root = PREFIX_MODE ? `${BASE_URL}/${PREFIX}` : BASE_URL

let server = null

async function waitReady(url, timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(3000) })
      if (res.ok)
        return
    }
    catch { /* not ready yet */ }
    await new Promise(r => setTimeout(r, 500))
  }
  throw new Error(`server not ready at ${url}`)
}

before(async () => {
  if (!process.env.BASE_URL) {
    const env = { ...process.env, PORT: String(PORT) }
    if (PREFIX_MODE)
      env.BASE_PREFIX = PREFIX
    server = spawn('node', ['.output/server/index.mjs'], {
      cwd: APP_ROOT,
      env,
      stdio: 'ignore',
    })
    // 前缀模式下 /health 也挂在前缀下，waitReady 需用 root
    await waitReady(root)
  }
})

after(() => {
  if (server)
    server.kill()
})

async function get(path, headers = {}) {
  const res = await fetch(`${root}${path}`, { headers })
  const text = await res.text()
  return { status: res.status, text, headers: res.headers }
}

// ---------- 数据与 API 契约 ----------
it('health ok', async () => {
  const { status, text } = await get('/health')
  assert.equal(status, 200)
  assert.equal(text, 'ok')
})

it('/api/list?format=lines 576 行且含关键模板', async () => {
  const { status, text } = await get('/api/list?format=lines')
  assert.equal(status, 200)
  const lines = text.split('\n')
  assert.equal(lines.length, 576)
  for (const t of ['node', 'visualstudiocode', 'python', 'go']) assert.ok(lines.includes(t))
})

it('/api/list?format=json 576 个模板', async () => {
  const res = await fetch(`${root}/api/list?format=json`)
  const body = await res.json()
  assert.equal(res.status, 200)
  assert.equal(Object.keys(body).length, 576)
  assert.ok(body.node)
})

it('/api/list 默认按 5 分组', async () => {
  const { text } = await get('/api/list')
  const first = text.split('\n')[0]
  assert.equal(first.split(',').length, 5)
})

it('/api/list 未知 format 500', async () => {
  const { status, text } = await get('/api/list?format=bogus')
  assert.equal(status, 500)
  assert.ok(text.includes('Unknown Format'))
})

it('/api/order 5 键且 java:0 gradle:1', async () => {
  const res = await fetch(`${root}/api/order`)
  const body = await res.json()
  assert.equal(Object.keys(body).length, 5)
  assert.equal(body.java, 0)
  assert.equal(body.gradle, 1)
})

it('/api/node 生成文本头尾与段头', async () => {
  const { status, text } = await get('/api/node')
  assert.equal(status, 200)
  const lines = text.split('\n')
  assert.ok(lines[0].startsWith('# Created by'))
  assert.ok(lines[1].startsWith('# Edit at'))
  assert.ok(text.includes('\n### Node ###\n'))
  const expectHost = PREFIX_MODE ? `https://www.toptal.com/${PREFIX}` : 'https://www.toptal.com'
  assert.ok(text.trimEnd().endsWith(`# End of ${expectHost}/api/node`))
})

it('/api/f/node 下载附件头', async () => {
  const { status, headers } = await get('/api/f/node')
  assert.equal(status, 200)
  assert.equal(headers.get('content-disposition'), 'attachment; filename="gitignore"')
})

it('/api 未知 key 404 + ERROR 注释', async () => {
  const { status, text } = await get('/api/notexist')
  assert.equal(status, 404)
  assert.ok(text.includes('#!! ERROR: notexist is undefined'))
})

it('/api 解码失败 500', async () => {
  const { status } = await get('/api/%E0%A4%A')
  assert.equal(status, 500)
})

it('/api/ 帮助文本', async () => {
  const { status, text } = await get('/api/')
  assert.equal(status, 200)
  assert.ok(text.includes('gitignore.io help:'))
  assert.ok(text.includes('list'))
  assert.ok(text.includes(':types:'))
})

it('/api 多模板组合', async () => {
  const { status, text } = await get('/api/node,go')
  assert.equal(status, 200)
  assert.ok(text.includes('### Node ###'))
  assert.ok(text.includes('### Go ###'))
})

it('/dropdown/templates.json 576 + term 过滤', async () => {
  const all = await (await fetch(`${root}/dropdown/templates.json`)).json()
  assert.equal(all.length, 576)
  const java = await (await fetch(`${root}/dropdown/templates.json?term=java`)).json()
  assert.ok(java.length > 0)
  assert.ok(java.every(t => t.id.includes('java')))
})

// ---------- 页面 / SEO ----------
it('首页 SEO（canonical / OG / Twitter / favicon）', async () => {
  const { status, text } = await get('/')
  assert.equal(status, 200)
  const expectUrl = PREFIX_MODE ? `https://www.toptal.com/${PREFIX}` : 'https://www.toptal.com'
  assert.ok(text.includes(`rel="canonical" href="${expectUrl}"`))
  assert.ok(text.includes('property="og:type" content="website"'))
  assert.ok(text.includes('property="og:title" content="gitignore.io"'))
  assert.ok(text.includes(`property="og:url" content="${expectUrl}"`))
  assert.ok(text.includes(`property="og:image" content="${expectUrl}/img/preview@2x.png"`))
  assert.ok(text.includes('name="twitter:card" content="summary_large_image"'))
  assert.ok(text.includes('name="twitter:site" content="@toptal"'))
  assert.ok(text.includes(`href="${PREFIX_MODE ? `/${PREFIX}` : ''}/favicon.ico"`))
})

it('i18n cookie 切换渲染', async () => {
  const zh = await (await fetch(`${root}/`, { headers: { Cookie: 'gitignore_locale=zh' } })).text()
  assert.ok(zh.includes('为你的项目'))
  const ja = await (await fetch(`${root}/`, { headers: { Cookie: 'gitignore_locale=ja' } })).text()
  assert.ok(ja.includes('プロジェクト'))
})

// ---------- 前缀模式 ----------
it('前缀模式：无前缀请求 404', { skip: !PREFIX_MODE }, async () => {
  for (const p of ['/', '/health', '/api/node', '/sitemap.xml']) {
    const res = await fetch(`${BASE_URL}${p}`)
    assert.equal(res.status, 404, `无前缀 ${p} 应为 404`)
  }
})

it('前缀模式：sitemap 含前缀站点', { skip: !PREFIX_MODE }, async () => {
  const { status, text } = await get('/sitemap.xml')
  assert.equal(status, 200)
  assert.ok(text.includes(`https://www.toptal.com/${PREFIX}`))
})

it('sitemap.xml 存在且含站点', async () => {
  const { status, text } = await get('/sitemap.xml')
  assert.equal(status, 200)
  assert.ok(text.includes('<loc>'))
})

// robots.txt 是站点级根文件：@nuxtjs/robots 注册在 /robots.txt 且不感知 baseURL，
// 前缀挂载模式下根路径被 baseURL 重定向走（模块限制），仅无前缀模式断言
it('robots.txt 由插件生成且指向 sitemap', { skip: PREFIX_MODE }, async () => {
  const res = await fetch(`${root}/robots.txt`)
  assert.equal(res.status, 200)
  const text = await res.text()
  assert.ok(text.includes('Sitemap'))
})

it('静态资源 preview@2x.png 与 favicon.ico', async () => {
  const img = await fetch(`${root}/img/preview@2x.png`)
  assert.equal(img.status, 200)
  assert.ok(img.headers.get('content-type').includes('image/png'))
  const ico = await fetch(`${root}/favicon.ico`)
  assert.equal(ico.status, 200)
  assert.ok(ico.headers.get('content-type').includes('image'))
})
