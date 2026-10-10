// GET /dropdown/templates.json —— select2 下拉数据源（对齐 SiteHandlers.createDropdownTemplates）
// [{ id: key, text: 文件名 }]，key 按长度升序、同长字母序；?term= 过滤 key 包含
export default defineEventHandler(async (event) => {
  const { templates } = await loadData(event)
  const term = getQuery(event).term
  const query = typeof term === 'string' ? term : undefined

  return Object.values(templates)
    .filter(t => query === undefined || t.key.includes(query))
    .sort((a, b) => a.key.localeCompare(b.key))
    .sort((a, b) => a.key.length - b.key.length)
    .map(t => ({ id: t.key, text: t.name }))
})
