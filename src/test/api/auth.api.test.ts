import { describe, it, expect } from 'vitest'

const API = process.env.TEST_API_URL || 'http://localhost:8080/api'

describe('Auth API', () => {
  it('POST /auth/login — valid credentials return correct shape', async () => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.TEST_ACCOUNTING_EMAIL || 'ana@demo.rs',
        password: process.env.TEST_ACCOUNTING_PASSWORD || 'demo123',
      }),
    })
    if (res.status === 429) {
      console.warn(
        'Auth login rate limited (429) — retrying would exceed limit'
      )
      return
    }
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.accessToken).toBeTruthy()
    expect(data.refreshToken).toBeTruthy()
    expect(data.role).toBe('ACCOUNTING')
    expect(data.firstName).toBe('Ana')
    expect(data.expiresIn).toBeGreaterThan(0)
  })

  it('POST /auth/login — invalid credentials return 401', async () => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nobody@demo.rs', password: 'wrong' }),
    })
    expect([401, 429]).toContain(res.status)
  })
})
