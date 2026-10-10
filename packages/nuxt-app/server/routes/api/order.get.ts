// GET /api/order —— 模板优先级 JSON（对齐 APIHandlers.createOrderEndpoint）
export default defineEventHandler(async (event) => {
  const { order } = await loadData(event)
  return order
})
