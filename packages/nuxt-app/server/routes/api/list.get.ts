// GET /api/list —— 模板列表（对齐 APIHandlers.createListEndpoint）
// 无 format：按键排序，每 5 个一组逗号连接、组间换行
// ?format=lines：每行一个 key；?format=json：全部模板模型 JSON；其他：500
export default defineEventHandler(async (event) => {
  const { templates } = await loadData()
  const keys = Object.keys(templates).sort()
  const format = getQuery(event).format

  if (format === undefined) {
    const grouped: string[] = []
    for (let i = 0; i < keys.length; i += 5) {
      grouped.push(keys.slice(i, i + 5).join(','))
    }
    return text(event, grouped.join('\n'))
  }

  if (format === 'lines') {
    return text(event, keys.join('\n'))
  }

  if (format === 'json') {
    return templates
  }

  return text(event, 'Unknown Format: `lines` or `json` are acceptable formats', 500)
})
