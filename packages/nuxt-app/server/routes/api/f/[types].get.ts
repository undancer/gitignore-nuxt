// GET /api/f/{types} —— 下载 .gitignore 附件（对齐 APIHandlers.createTemplateDownloadEndpoint）
export default defineEventHandler(async (event) => {
  const types = getRouterParam(event, 'types') ?? ''
  const { text: body, status } = await createIgnore(types, event)
  const filename = (useAppConfig() as any).gitignore?.downloadFilename ?? 'gitignore'
  return text(event, body, status, { 'content-disposition': `attachment; filename="${filename}"` })
})
