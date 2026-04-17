const API = process.env.TEST_API_URL || 'http://localhost:8080/api'
const GRAPHQL = API.replace('/api', '/graphql')

let token: string | null = null

async function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function ensureToken(): Promise<void> {
  if (token) return

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.TEST_USER_EMAIL || 'marko@demo.rs',
        password: process.env.TEST_USER_PASSWORD || 'demo123',
      }),
    })

    if (res.ok) {
      const data = await res.json()
      token = data.accessToken
      return
    }

    if (res.status === 429) {
      const retryAfter = Number(res.headers.get('Retry-After') || 6)
      await wait(retryAfter * 1000)
      continue
    }

    throw new Error(`Login failed: ${res.status}`)
  }
  throw new Error('Login failed after 3 retries (rate limited)')
}

export async function rest(method: string, path: string, body?: unknown) {
  await ensureToken()

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (res.status === 429) {
      const retryAfter = Number(res.headers.get('Retry-After') || 3)
      await wait(retryAfter * 1000)
      continue
    }

    const data = res.status === 204 ? null : await res.json().catch(() => null)
    return { status: res.status, data }
  }

  return { status: 429, data: null }
}

export async function graphql(
  query: string,
  variables?: Record<string, unknown>
) {
  await ensureToken()

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(GRAPHQL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables }),
    })

    if (res.status === 429) {
      const retryAfter = Number(res.headers.get('Retry-After') || 3)
      await wait(retryAfter * 1000)
      continue
    }

    return res.json()
  }

  return { data: null, errors: [{ message: 'Rate limited after 3 retries' }] }
}
