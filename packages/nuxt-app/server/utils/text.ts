// 纯文本响应 helper（对齐遗留 Vapor 的 text/plain 行为）
export function text(event: any, body: string, status = 200, extraHeaders: Record<string, string> = {}) {
  setResponseHeaders(event, {
    'content-type': 'text/plain; charset=utf-8',
    ...extraHeaders,
  })
  setResponseStatus(event, status)
  return body
}
