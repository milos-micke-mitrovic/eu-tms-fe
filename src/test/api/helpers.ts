const API = 'http://localhost:8080/api'
const GRAPHQL = 'http://localhost:8080/graphql'

let token: string | null = null

export async function ensureToken(): Promise<void> {
  if (token) return

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'marko@demo.rs', password: 'demo123' }),
    })

    if (res.ok) {
      const data = await res.json()
      token = data.accessToken
      return
    }

    if (res.status === 429) {
      const wait = Number(res.headers.get('Retry-After') || 6)
      await new Promise((r) => setTimeout(r, wait * 1000))
      continue
    }

    throw new Error(`Login failed: ${res.status}`)
  }
  throw new Error('Login failed after 3 retries (rate limited)')
}

export async function rest(method: string, path: string, body?: unknown) {
  await ensureToken()
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = res.status === 204 ? null : await res.json().catch(() => null)
  return { status: res.status, data }
}

export async function graphql(query: string, variables?: Record<string, unknown>) {
  await ensureToken()
  const res = await fetch(GRAPHQL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  })
  return res.json()
}
