import { describe, it, expect } from 'vitest'
import { rest } from './helpers'
import { assertRestSuccess } from './assert-helpers'

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
    const result = await saRest('GET', '/tenants')
    assertRestSuccess(result!, [200], 'list tenants')
    expect(Array.isArray(result!.data)).toBe(true)
    expect(result!.data.length).toBeGreaterThan(0)
    expect(result!.data[0]).toHaveProperty('id')
    expect(result!.data[0]).toHaveProperty('subdomain')
    expect(result!.data[0]).toHaveProperty('name')
    expect(result!.data[0]).toHaveProperty('active')
  })

  it('GET /tenants/active — active only', async () => {
    const result = await saRest('GET', '/tenants/active')
    assertRestSuccess(result!, [200], 'list active tenants')
    for (const t of result!.data) {
      expect(t.active).toBe(true)
    }
  })

  it('CRUD tenant with companies and users', async () => {
    const slug = `t${Date.now()}${Math.random().toString(36).slice(2, 5)}`

    // Create tenant
    const createResult = await saRest('POST', '/tenants', {
      subdomain: slug,
      name: `Test Firma ${slug}`,
      active: true,
    })
    assertRestSuccess(createResult!, [201], 'create tenant')
    expect(createResult!.data.id).toBeTruthy()

    const tenantId = createResult!.data.id

    // Create company
    const companyResult = await saRest(
      'POST',
      `/tenants/${tenantId}/companies`,
      {
        name: `Firma ${slug}`,
        pib: '100000008',
      }
    )
    assertRestSuccess(companyResult!, [201], 'create company')
    expect(companyResult!.data).toHaveProperty('id')
    expect(companyResult!.data.name).toBe(`Firma ${slug}`)

    // List companies
    const listCompaniesResult = await saRest(
      'GET',
      `/tenants/${tenantId}/companies`
    )
    assertRestSuccess(listCompaniesResult!, [200], 'list companies')
    expect(Array.isArray(listCompaniesResult!.data)).toBe(true)
    expect(listCompaniesResult!.data.length).toBeGreaterThanOrEqual(1)

    // Create user
    const userResult = await saRest('POST', `/tenants/${tenantId}/users`, {
      firstName: 'Test',
      lastName: 'Admin',
      email: `admin-${slug}@test.rs`,
      password: 'testpass123',
      role: 'ADMIN',
      companyId: companyResult!.data.id,
    })
    assertRestSuccess(userResult!, [201], 'create user')
    expect(userResult!.data).toHaveProperty('id')
    expect(userResult!.data.email).toBe(`admin-${slug}@test.rs`)
    expect(userResult!.data.role).toBe('ADMIN')

    // List users
    const listUsersResult = await saRest('GET', `/tenants/${tenantId}/users`)
    assertRestSuccess(listUsersResult!, [200], 'list users')
    expect(Array.isArray(listUsersResult!.data)).toBe(true)
    expect(listUsersResult!.data.length).toBeGreaterThanOrEqual(1)

    // List admins
    const adminsResult = await saRest('GET', `/tenants/${tenantId}/admins`)
    assertRestSuccess(adminsResult!, [200], 'list admins')
    expect(Array.isArray(adminsResult!.data)).toBe(true)

    // Toggle status
    const toggleResult = await saRest(
      'PATCH',
      `/tenants/${tenantId}/toggle-status`
    )
    assertRestSuccess(toggleResult!, [204], 'toggle tenant status')

    // Delete
    const deleteResult = await saRest('DELETE', `/tenants/${tenantId}`)
    assertRestSuccess(deleteResult!, [204], 'delete tenant')
  })

  it('regular admin cannot access /tenants', async () => {
    const result = await rest('GET', '/tenants')
    assertRestSuccess(result, [403], 'regular admin tenants access')
  })
})
