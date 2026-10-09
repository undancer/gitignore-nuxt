// https://nuxt.com/docs/api/configuration/nuxt-config
import appConfig from './app/app.config'

// BASE_PREFIX → app.baseURL：把整个应用（页面 + 资源 + API）挂到子路径下
const basePrefix = (appConfig.gitignore.basePrefix ?? '').replace(/^\/+|\/+$/g, '')

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // 子路径挂载：无前缀时 '/'；有前缀时 '/{basePrefix}/'
  app: {
    baseURL: basePrefix ? `/${basePrefix}/` : '/',
  },

  modules: [
    '@nuxtjs/i18n',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    // 样式：UnoCSS v4（presetWind4，内置 reset）+ 全局 scss
    '@unocss/nuxt',
    // 常用插件：Pinia 状态管理 / VueUse composables
    '@pinia/nuxt',
    '@vueuse/nuxt',
  ],
  css: ['~/assets/css/main.scss'],
  // 站点身份（@nuxtjs/sitemap v8 经 nuxt-site-config 读取 site.url；相对 loc 自动并入 baseURL 前缀）
  site: {
    url: appConfig.gitignore.hostOrigin,
  },
  robots: {
    // 默认允许抓取；Sitemap 由 sitemap 模块的 robots:config hook 自动追加
    rules: [{ UserAgent: '*', Allow: '/' }],
  },
  i18n: {
    // 对齐遗留 Localizations/ 的 17 种语言
    locales: [
      { code: 'en', iso: 'en-US', file: 'en.json', name: 'English' },
      { code: 'zh', iso: 'zh-CN', file: 'zh.json', name: '中文' },
      { code: 'ja', iso: 'ja-JP', file: 'ja.json', name: '日本語' },
      { code: 'ko', iso: 'ko-KR', file: 'ko.json', name: '한국어' },
      { code: 'de', iso: 'de-DE', file: 'de.json', name: 'Deutsch' },
      { code: 'fr', iso: 'fr-FR', file: 'fr.json', name: 'Français' },
      { code: 'pt', iso: 'pt-PT', file: 'pt.json', name: 'Português' },
      { code: 'ru', iso: 'ru-RU', file: 'ru.json', name: 'Русский' },
      { code: 'ar', iso: 'ar-SA', file: 'ar.json', name: 'العربية' },
      { code: 'el', iso: 'el-GR', file: 'el.json', name: 'Ελληνικά' },
      { code: 'fa', iso: 'fa-IR', file: 'fa.json', name: 'فارسی' },
      { code: 'id', iso: 'id-ID', file: 'id.json', name: 'Bahasa Indonesia' },
      { code: 'nl', iso: 'nl-NL', file: 'nl.json', name: 'Nederlands' },
      { code: 'ro', iso: 'ro-RO', file: 'ro.json', name: 'Română' },
      { code: 'th', iso: 'th-TH', file: 'th.json', name: 'ไทย' },
      { code: 'tr', iso: 'tr-TR', file: 'tr.json', name: 'Türkçe' },
      { code: 'cs', iso: 'cs-CZ', file: 'cs.json', name: 'Čeština' },
    ],
    // langDir 相对 i18n 基准目录（{root}/i18n），语言文件在 i18n/locales/
    langDir: 'locales',
    lazy: true,
    defaultLocale: 'en',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'gitignore_locale',
      redirectOn: 'root',
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
