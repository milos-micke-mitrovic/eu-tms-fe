import { describe, it, expect } from 'vitest'
import { rest, graphql, ensureToken } from './helpers'

const API = process.env.TEST_API_URL || 'http://localhost:8080/api'

async function getToken(): Promise<string> {
  await ensureToken()
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.TEST_USER_EMAIL || 'marko@demo.rs',
      password: process.env.TEST_USER_PASSWORD || 'demo123',
    }),
  })
  const data = await res.json()
  return data.accessToken
}

describe('File Upload API (two-phase flow)', () => {
  let vehicleId: string | null = null

  it('setup — get vehicle', async () => {
    const res = await graphql(`
      {
        vehicles(page: 0, size: 1) {
          content {
            id
          }
        }
      }
    `)
    vehicleId = res.data.vehicles.content[0]?.id
    expect(vehicleId).toBeTruthy()
  })

  it('POST /vehicles/{id}/documents — returns 400 without required fields', async () => {
    if (!vehicleId) return
    const result = await rest('POST', `/vehicles/${vehicleId}/documents`, {})
    expect(result.status).toBe(400)
  })

  it('GET /documents/download/VEHICLE/{id} — returns 404 for nonexistent doc', async () => {
    const result = await rest('GET', '/documents/download/VEHICLE/99999')
    expect([404, 400]).toContain(result.status)
  })

  it('DELETE /documents/temp/{name} — soft-fail for nonexistent', async () => {
    const result = await rest('DELETE', '/documents/temp/nonexistent.pdf')
    expect([200, 204, 400, 404]).toContain(result.status)
  })

  it('POST /documents/upload/temp — endpoint exists and requires file', async () => {
    const token = await getToken()
    const formData = new FormData()
    // Send empty form — should get MISSING_REQUEST_PART
    const res = await fetch(`${API}/documents/upload/temp`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
    // 400 = missing file (expected)
    expect([400, 415]).toContain(res.status)
  })
})
