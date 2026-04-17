import { describe, it, expect } from 'vitest'
import { rest } from './helpers'

const API = process.env.TEST_API_URL || 'http://localhost:8080/api'
let saToken: string | null = null

async function ensureSuperAdminToken() {
  if (saToken) return
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'superadmin@eutms.com',
        password: 'admin123',
      }),
    })
    if (res.ok) {
      const data = await res.json()
      saToken = data.accessToken
      return
    }
    const wait = Number(res.headers.get('Retry-After') || 6)
    await new Promise((r) => setTimeout(r, wait * 1000))
  }
  throw new Error('SuperAdmin login failed after 5 retries')
}

async function saRest(method: string, path: string, body?: unknown) {
  await ensureSuperAdminToken()
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${saToken}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (res.status === 429) {
      const wait = Number(res.headers.get('Retry-After') || 3)
      await new Promise((r) => setTimeout(r, wait * 1000))
      continue
    }
    const data = res.status === 204 ? null : await res.json().catch(() => null)
    return { status: res.status, data }
  }
  return { status: 429, data: null }
}

describe('Tenants API (SUPER_ADMIN)', () => {
  it('GET /tenants — list tenants', async () => {
    const { status, data } = await saRest('GET', '/tenants')
    expect(status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
    expect(data[0]).toHaveProperty('id')
    expect(data[0]).toHaveProperty('subdomain')
    expect(data[0]).toHaveProperty('name')
    expect(data[0]).toHaveProperty('active')
  })

  it('GET /tenants/active — active only', async () => {
    const { status, data } = await saRest('GET', '/tenants/active')
    expect(status).toBe(200)
    for (const t of data) {
      expect(t.active).toBe(true)
    }
  })

  it('CRUD tenant with companies and users', async () => {
    const slug = `t${Date.now()}${Math.random().toString(36).slice(2, 5)}`

    // Create tenant
    const { status: createStatus, data: created } = await saRest(
      'POST',
      '/tenants',
      { subdomain: slug, name: `Test Firma ${slug}`, active: true }
    )
    expect(createStatus).toBe(201)
    expect(created.id).toBeTruthy()

    const tenantId = created.id

    // Create company
    const { status: companyStatus, data: company } = await saRest(
      'POST',
      `/tenants/${tenantId}/companies`,
      { name: `Firma ${slug}`, pib: '100000008' }
    )
    expect(companyStatus).toBe(201)
    expect(company).toHaveProperty('id')
    expect(company.name).toBe(`Firma ${slug}`)

    // List companies
    const { status: listCompaniesStatus, data: companies } = await saRest(
      'GET',
      `/tenants/${tenantId}/companies`
    )
    expect(listCompaniesStatus).toBe(200)
    expect(Array.isArray(companies)).toBe(true)
    expect(companies.length).toBeGreaterThanOrEqual(1)

    // Create user
    const { status: userStatus, data: user } = await saRest(
      'POST',
      `/tenants/${tenantId}/users`,
      {
        firstName: 'Test',
        lastName: 'Admin',
        email: `admin-${slug}@test.rs`,
        password: 'testpass123',
        role: 'ADMIN',
        companyId: company.id,
      }
    )
    expect(userStatus).toBe(201)
    expect(user).toHaveProperty('id')
    expect(user.email).toBe(`admin-${slug}@test.rs`)
    expect(user.role).toBe('ADMIN')

    // List users
    const { status: listUsersStatus, data: users } = await saRest(
      'GET',
      `/tenants/${tenantId}/users`
    )
    expect(listUsersStatus).toBe(200)
    expect(Array.isArray(users)).toBe(true)
    expect(users.length).toBeGreaterThanOrEqual(1)

    // List admins
    const { status: adminsStatus, data: admins } = await saRest(
      'GET',
      `/tenants/${tenantId}/admins`
    )
    expect(adminsStatus).toBe(200)
    expect(Array.isArray(admins)).toBe(true)

    // Toggle status
    const { status: toggleStatus } = await saRest(
      'PATCH',
      `/tenants/${tenantId}/toggle-status`
    )
    expect(toggleStatus).toBe(204)

    // Delete
    const { status: deleteStatus } = await saRest(
      'DELETE',
      `/tenants/${tenantId}`
    )
    expect(deleteStatus).toBe(204)
  })

  it('regular admin cannot access /tenants', async () => {
    const { status } = await rest('GET', '/tenants')
    expect(status).toBe(403)
  })
})
