// ESLint 扁平配置 —— @antfu/eslint-config（antfu 风格，含 vue/ts 规则）
import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,
  ignores: [
    '**/.output/**',
    '**/.nuxt/**',
    '**/public/**',
    '**/server/templates/**',
    '**/*.min.js',
    '**/test/**',
  ],
}, {
  // Nuxt 构建期配置（app.config/nuxt.config）在 Node 环境求值，允许全局 process
  rules: {
    'node/prefer-global/process': 'off',
  },
})
