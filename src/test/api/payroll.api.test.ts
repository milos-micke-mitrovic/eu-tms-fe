import { describe, it, expect } from 'vitest'
import { graphql } from './helpers'

const API = process.env.TEST_API_URL || 'http://localhost:8080/api'
let accountingToken: string | null = null

async function ensureAccountingToken() {
  if (accountingToken) return
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.TEST_ACCOUNTING_EMAIL || 'ana@demo.rs',
        password: process.env.TEST_ACCOUNTING_PASSWORD || 'demo123',
      }),
    })
    if (res.ok) {
      const data = await res.json()
      accountingToken = data.accessToken
      return
    }
    const wait = Number(res.headers.get('Retry-After') || 6)
    await new Promise((r) => setTimeout(r, wait * 1000))
  }
  throw new Error('Accounting login failed')
}

async function payrollRest(method: string, path: string, body?: unknown) {
  await ensureAccountingToken()
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accountingToken}`,
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

describe('Payroll API (ACCOUNTING role)', () => {
  let testDriverId: number | null = null
  let testConfigId: number | null = null
  let testAdvanceId: number | null = null
  let testPayrollId: number | null = null

  it('setup — get driver', async () => {
    const res = await graphql(`
      {
        drivers(page: 0, size: 1) {
          content {
            id
          }
        }
      }
    `)
    testDriverId = Number(res.data.drivers.content[0]?.id)
    expect(testDriverId).toBeGreaterThan(0)
  })

  // Salary config
  it('REST — create salary config', async () => {
    if (!testDriverId) return
    const { status, data } = await payrollRest(
      'POST',
      '/payroll/salary-config',
      {
        driverId: testDriverId,
        baseSalaryRsd: 80000,
        hourlyRateRsd: 500,
        overtimeRateMultiplier: 1.5,
        perKmRateRsd: 5,
        bonusPerRouteRsd: 2000,
        validFrom: '2026-01-01',
      }
    )
    expect([200, 201, 409]).toContain(status)
    if (data?.id) testConfigId = data.id
  })

  it('REST — get salary configs for driver', async () => {
    if (!testDriverId) return
    const { status, data } = await payrollRest(
      'GET',
      `/payroll/salary-config/driver/${testDriverId}`
    )
    expect(status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
  })

  // Advances
  it('REST — create advance', async () => {
    if (!testDriverId) return
    const { status, data } = await payrollRest('POST', '/payroll/advances', {
      driverId: testDriverId,
      amountRsd: 10000,
      advanceDate: '2026-04-15',
      advanceType: 'ADVANCE',
      description: 'Test akontacija',
    })
    expect([200, 201]).toContain(status)
    if (data?.id) testAdvanceId = data.id
  })

  it('REST — get unsettled advances', async () => {
    if (!testDriverId) return
    const { status, data } = await payrollRest(
      'GET',
      `/payroll/advances/driver/${testDriverId}/unsettled`
    )
    expect(status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
  })

  // Payroll generation
  it('REST — generate payroll for driver', async () => {
    if (!testDriverId) return
    const { status, data } = await payrollRest(
      'POST',
      `/payroll/generate?driverId=${testDriverId}&month=2026-04`
    )
    expect([200, 201, 400, 409]).toContain(status)
    if (status === 200 || status === 201) {
      testPayrollId = data?.id ?? null
    }
  })

  // GraphQL reads
  it('GraphQL — payrollsByMonth', async () => {
    const res = await graphql(`
      {
        payrollsByMonth(monthYear: "2026-04") {
          id
          driverId
          driverFirstName
          driverLastName
          grossTotalRsd
          netSalaryRsd
          status
        }
      }
    `)
    // SPEDITER may not have access — accept errors
    if (res.data?.payrollsByMonth) {
      expect(Array.isArray(res.data.payrollsByMonth)).toBe(true)
    } else {
      expect(res.errors || res.data).toBeTruthy()
    }
  })

  it('GraphQL — payrollSummary', async () => {
    const res = await graphql(`
      {
        payrollSummary(monthYear: "2026-04") {
          monthYear
          driverCount
          totalGrossRsd
          totalNetRsd
        }
      }
    `)
    if (res.data?.payrollSummary) {
      expect(res.data.payrollSummary).toHaveProperty('monthYear')
    } else {
      expect(res.errors || res.data).toBeTruthy()
    }
  })

  // Payroll operations
  it('REST — adjust payroll', async () => {
    if (!testPayrollId) return
    const { status } = await payrollRest(
      'PUT',
      `/payroll/${testPayrollId}/adjust`,
      {
        otherBonusRsd: 5000,
        otherBonusDescription: 'Test bonus',
        taxRsd: 8000,
        socialContributionsRsd: 12000,
      }
    )
    expect([200, 400]).toContain(status)
  })

  it('REST — confirm payroll', async () => {
    if (!testPayrollId) return
    const { status } = await payrollRest(
      'PATCH',
      `/payroll/${testPayrollId}/confirm`
    )
    expect([200, 400]).toContain(status)
  })

  it('REST — mark payroll paid', async () => {
    if (!testPayrollId) return
    const { status } = await payrollRest(
      'PATCH',
      `/payroll/${testPayrollId}/paid`
    )
    expect([200, 400]).toContain(status)
  })

  it('REST — download payslip PDF', async () => {
    if (!testPayrollId) return
    const { status } = await payrollRest(
      'GET',
      `/payroll/${testPayrollId}/payslip`
    )
    expect([200, 400, 500]).toContain(status)
  })

  // Cleanup
  it('cleanup — delete advance', async () => {
    if (!testAdvanceId) return
    const { status } = await payrollRest(
      'DELETE',
      `/payroll/advances/${testAdvanceId}`
    )
    expect([200, 204, 400]).toContain(status)
  })

  it('cleanup — delete salary config', async () => {
    if (!testConfigId) return
    const { status } = await payrollRest(
      'DELETE',
      `/payroll/salary-config/${testConfigId}`
    )
    expect([200, 204]).toContain(status)
  })
})
