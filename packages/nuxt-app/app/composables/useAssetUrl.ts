// 生成 public 静态资源在 baseURL 前缀下的完整 URL（遗留用 <base href> + 相对路径，Nuxt 需显式拼前缀）
export function useAssetUrl() {
  const baseURL = useRuntimeConfig().app.baseURL.replace(/\/+$/, '')
  return (path: string) => `${baseURL}${path.startsWith('/') ? path : `/${path}`}`
}
