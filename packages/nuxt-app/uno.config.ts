// UnoCSS v4（presetWind4，Tailwind v4 兼容）—— 内置 reset（无需 @unocss/reset）
// @apply 指令由 transformerDirectives 提供，支持在 scss/scoped 样式中按分类多行使用
import { defineConfig, presetWind4, transformerDirectives } from 'unocss'

export default defineConfig({
  presets: [
    presetWind4({
      preflights: {
        reset: true,
      },
    }),
  ],
  transformers: [transformerDirectives()],
  theme: {
    // 品牌色迁移自 legacy/gitignore.io/src/less/variables.less
    colors: {
      brand: {
        black: '#000000',
        white: '#ffffff',
        semiWhite: '#ebeced',
        blue: '#204ecf',
        green: '#00cc83',
        darkgreen: '#00a369',
        darkgray: '#455065',
        gray: '#a6abb5',
        lightgray: '#d8d9dc',
        darkBlue: '#0f256e',
      },
    },
    fontFamily: {
      // Proxima Nova 迁移自 legacy/gitignore.io/Public/fonts/
      sans: '"Proxima Nova", Arial, sans-serif',
    },
  },
})
