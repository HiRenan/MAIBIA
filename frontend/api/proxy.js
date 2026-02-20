export const config = {
  runtime: 'edge',
}

const BACKEND_BASE_URL = 'https://maibia-production.up.railway.app'
const TARGET_ORIGIN = (
  process.env.RAILWAY_BACKEND_URL || BACKEND_BASE_URL
).replace(/\/+$/, '')

export default async function handler(request) {
  const incomingUrl = new URL(request.url)
  const proxiedPath = incomingUrl.searchParams.get('path') || ''
  const targetUrl = new URL(`${TARGET_ORIGIN}/api/${proxiedPath}`)

  incomingUrl.searchParams.forEach((value, key) => {
    if (key !== 'path') targetUrl.searchParams.append(key, value)
  })

  const headers = new Headers(request.headers)
  headers.delete('host')
  headers.delete('content-length')

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
