// BASE_PREFIX 子路径挂载的"无前缀请求 → 404"守卫（对齐遗留 withBasePrefix 严格语义）。
// Nitro 会把所有 middleware/路由挂在 app.baseURL 下，无前缀请求进不了任何 handler，
// 会落到 Nuxt 的 404 handler 并被转成 302 重定向。这里在 h3App 最外层挂一个 '/' 守卫，
// 配置了前缀且请求未带前缀时直接返回 404。
export default defineNitroPlugin((nitroApp) => {
  nitroApp.h3App.use('/', (event) => {
    const cfg = (useAppConfig() as any).gitignore ?? {}
    const prefix = (cfg.basePrefix ?? '').trim().replace(/^\/+|\/+$/g, '')
    if (!prefix)
      return

    const pathname = getRequestURL(event).pathname.replace(/^\/+|\/+$/g, '')
    if (pathname === prefix || pathname.startsWith(`${prefix}/`))
      return

    setResponseStatus(event, 404, 'Not Found')
    return send(event, 'Not Found')
  })
})
