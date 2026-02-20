export const config = {
  runtime: 'edge',
}

const BACKEND_BASE_URL = 'https://maibia-production.up.railway.app'
const TARGET_ORIGIN = (
  process.env.RAILWAY_BACKEND_URL || BACKEND_BASE_URL
).replace(/\/+$/, '')

export default async function handler(request) {
  const incomingUrl = new URL(request.url)
  const proxiedPath = incomingUrl.pathname.replace(/^\/api\/?/, '')
  const targetUrl = new URL(
    `${TARGET_ORIGIN}/api/${proxiedPath}${incomingUrl.search}`
  )

  const headers = new Headers()
  const accept = request.headers.get('accept')
  const contentType = request.headers.get('content-type')
  const authorization = request.headers.get('authorization')

  if (accept) headers.set('accept', accept)
  if (contentType) headers.set('content-type', contentType)
  if (authorization) headers.set('authorization', authorization)

  const response = await fetch(targetUrl.toString(), {
    method: request.method,
    headers,
    body:
      request.method === 'GET' || request.method === 'HEAD'
        ? undefined
        : request.body,
    redirect: 'manual',
  })

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  })
}
