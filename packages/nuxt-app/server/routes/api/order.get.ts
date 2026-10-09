// GET /api/order —— 模板优先级 JSON（对齐 APIHandlers.createOrderEndpoint）
export default defineEventHandler(async () => {
  const { order } = await loadData()
  return order
})
