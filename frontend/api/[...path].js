export const config = {
  runtime: 'edge',
}

const BACKEND_BASE_URL = 'https://maibia-production.up.railway.app'

export default async function handler(request) {
  const incomingUrl = new URL(request.url)
  const proxiedPath = incomingUrl.pathname.replace(/^\/api\/?/, '')
  const targetUrl = new URL(
    `${BACKEND_BASE_URL}/api/${proxiedPath}${incomingUrl.search}`
  )
  const forwardedHeaders = new Headers(request.headers)
  forwardedHeaders.delete('host')

  const response = await fetch(targetUrl.toString(), {
    method: request.method,
    headers: forwardedHeaders,
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
