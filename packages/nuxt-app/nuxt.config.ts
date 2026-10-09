// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  // canonical/SEO 站点地址（对齐遗留 HOST_ORIGIN，可用 NUXT_PUBLIC_SITE_URL 覆盖）
  runtimeConfig: {
    public: {
      siteUrl: 'https://www.toptal.com',
    },
  },
  // https://github.com/nuxt/nuxt/issues/36467
  // Nuxt 4.6.0 + Nitro 在 Windows 下 externals 匹配使用 `/` 分隔，
  // nuxt/dist 的 renderer 被留为 external，运行时读不到 manifest/precomputed stub 导致 500。
  // 用跨平台分隔符的正则强制内联 nuxt/dist 修复。
  nitro: {
    externals: { inline: [/[\\/]node_modules[\\/]nuxt[\\/]dist[\\/]/] },
    // 挂载 gitignore 模板数据目录（660 个模板 + order + patch + stack），
    // 运行时通过 useStorage('templates') 读取，构建时复制进 .output/server/assets
    serverAssets: [
      { baseName: 'templates', dir: './server/templates' },
    ],
  },
})
