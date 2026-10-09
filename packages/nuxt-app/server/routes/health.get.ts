// GET /health —— 健康检查（对齐 SiteHandlers.addHealthEndpoint）
export default defineEventHandler(event => text(event, 'ok'))
