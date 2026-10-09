// 应用级配置（构建时求值，server/client 同值；useAppConfig() 读取）
// 环境变量 HOST_ORIGIN / BASE_PREFIX 可覆盖，与遗留 Swift 部署方式对齐：
//   - hostOrigin：服务对外展示的站点地址，用于 canonical 与生成文本头部注释
//   - basePrefix：把服务整体挂载到域名下的某个子路径（如 'developers/gitignore'）
// 其余为站点级常量（外部链接、下载文件名、列表分组等），统一在此管理
export default {
  gitignore: {
    hostOrigin: (process.env.HOST_ORIGIN ?? 'https://www.toptal.com').trim().replace(/^\/+|\/+$/g, ''),
    basePrefix: (process.env.BASE_PREFIX ?? '').trim().replace(/^\/+|\/+$/g, ''),

    // 外部链接（页头导航）
    sourceCodeUrl: 'https://github.com/undancer/gitignore-nuxt',
    commandLineDocsUrl: 'https://docs.gitignore.io/install/command-line',

    // /api/f/{types} 下载附件文件名（Content-Disposition）
    downloadFilename: 'gitignore',

    // 页面搜索建议最多展示条数
    suggestLimit: 20,

    // /api/list 默认格式每行模板个数（无 ?format 时按 N 个一组逗号连接）
    listGroupSize: 5,
  },
}
