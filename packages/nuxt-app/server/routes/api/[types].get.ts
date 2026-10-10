// GET /api/{types} —— 生成 .gitignore 文本（对齐 APIHandlers.createIgnoreEndpoint）
export default defineEventHandler(async (event) => {
  const types = getRouterParam(event, 'types') ?? ''
  const { text: body, status } = await createIgnore(types, event)
  return text(event, body, status)
})
