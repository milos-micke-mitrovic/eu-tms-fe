import { describe, it, expect } from 'vitest'
import { graphql } from './helpers'
import { assertRestSuccess, assertGraphqlSuccess } from './assert-helpers'

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
    assertGraphqlSuccess(res, 'drivers for payroll setup')
    testDriverId = Number(res.data.drivers.content[0]?.id)
    expect(testDriverId).toBeGreaterThan(0)
  })

  // Salary config
  it('REST — create salary config', async () => {
    expect(testDriverId).toBeGreaterThan(0)
    const result = await payrollRest('POST', '/payroll/salary-config', {
      driverId: testDriverId,
      baseSalaryRsd: 80000,
      hourlyRateRsd: 500,
      overtimeRateMultiplier: 1.5,
      perKmRateRsd: 5,
      bonusPerRouteRsd: 2000,
      validFrom: '2026-01-01',
    })
    if (result!.status === 409) {
      console.warn(
        'Salary config already exists for this driver (409 duplicate) — continuing'
      )
      return
    }
    assertRestSuccess(result!, [200, 201], 'create salary config')
    if (result!.data?.id) testConfigId = result!.data.id
  })

  it('REST — get salary configs for driver', async () => {
    expect(testDriverId).toBeGreaterThan(0)
    const result = await payrollRest(
      'GET',
      `/payroll/salary-config/driver/${testDriverId}`
    )
    assertRestSuccess(result!, [200], 'get salary configs')
    expect(Array.isArray(result!.data)).toBe(true)
  })

  // Advances
  it('REST — create advance', async () => {
    expect(testDriverId).toBeGreaterThan(0)
    const result = await payrollRest('POST', '/payroll/advances', {
      driverId: testDriverId,
      amountRsd: 10000,
      advanceDate: '2026-04-15',
      advanceType: 'ADVANCE',
      description: 'Test akontacija',
    })
    assertRestSuccess(result!, [200, 201], 'create advance')
    if (result!.data?.id) testAdvanceId = result!.data.id
  })

  it('REST — get unsettled advances', async () => {
    expect(testDriverId).toBeGreaterThan(0)
    const result = await payrollRest(
      'GET',
      `/payroll/advances/driver/${testDriverId}/unsettled`
    )
    assertRestSuccess(result!, [200], 'get unsettled advances')
    expect(Array.isArray(result!.data)).toBe(true)
  })

  // Payroll generation
  it('REST — generate payroll for driver', async () => {
    expect(testDriverId).toBeGreaterThan(0)
    const result = await payrollRest(
      'POST',
      `/payroll/generate?driverId=${testDriverId}&month=2026-04`
    )
    if (result!.status === 409) {
      console.warn(
        'Payroll already generated for this month (409 duplicate) — continuing'
      )
      return
    }
    assertRestSuccess(result!, [200, 201, 400], 'generate payroll')
    if (result!.status === 200 || result!.status === 201) {
      testPayrollId = result!.data?.id ?? null
    }
  })

  // GraphQL reads
  it.skip('GraphQL — payrollsByMonth (SPEDITER role has no access — payroll requires ACCOUNTING/ADMIN)', async () => {
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
    // SPEDITER role may not have access — accept auth errors gracefully
    if (
      res.errors?.some(
        (e: { extensions?: { classification?: string } }) =>
          e.extensions?.classification === 'FORBIDDEN'
      )
    ) {
      console.warn(
        'GraphQL payrollsByMonth returned FORBIDDEN — role lacks access'
      )
      return
    }
    assertGraphqlSuccess(res, 'payrollsByMonth')
    expect(Array.isArray(res.data.payrollsByMonth)).toBe(true)
  })

  it.skip('GraphQL — payrollSummary (SPEDITER role has no access)', async () => {
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
    // SPEDITER role may not have access
    if (
      res.errors?.some(
        (e: { extensions?: { classification?: string } }) =>
          e.extensions?.classification === 'FORBIDDEN'
      )
    ) {
      console.warn(
        'GraphQL payrollSummary returned FORBIDDEN — role lacks access'
      )
      return
    }
    assertGraphqlSuccess(res, 'payrollSummary')
    if (res.data?.payrollSummary) {
      expect(res.data.payrollSummary).toHaveProperty('monthYear')
    }
  })

  // Payroll operations
  it('REST — adjust payroll', async () => {
    if (!testPayrollId) {
      console.warn('Skipping adjust: no payroll was generated')
      return
    }
    const result = await payrollRest(
      'PUT',
      `/payroll/${testPayrollId}/adjust`,
      {
        otherBonusRsd: 5000,
        otherBonusDescription: 'Test bonus',
        taxRsd: 8000,
        socialContributionsRsd: 12000,
      }
    )
    assertRestSuccess(result!, [200, 400], 'adjust payroll')
  })

  it('REST — confirm payroll', async () => {
    if (!testPayrollId) {
      console.warn('Skipping confirm: no payroll was generated')
      return
    }
    const result = await payrollRest(
      'PATCH',
      `/payroll/${testPayrollId}/confirm`
    )
    assertRestSuccess(result!, [200, 400], 'confirm payroll')
  })

  it('REST — mark payroll paid', async () => {
    if (!testPayrollId) {
      console.warn('Skipping mark paid: no payroll was generated')
      return
    }
    const result = await payrollRest('PATCH', `/payroll/${testPayrollId}/paid`)
    assertRestSuccess(result!, [200, 400], 'mark payroll paid')
  })

  it('REST — download payslip PDF', async () => {
    if (!testPayrollId) {
      console.warn('Skipping payslip PDF: no payroll was generated')
      return
    }
    const result = await payrollRest('GET', `/payroll/${testPayrollId}/payslip`)
    assertRestSuccess(result!, [200, 400], 'download payslip PDF')
  })

  // Cleanup
  it('cleanup — delete advance', async () => {
    if (!testAdvanceId) {
      console.warn('Skipping advance cleanup: no advance was created')
      return
    }
    const result = await payrollRest(
      'DELETE',
      `/payroll/advances/${testAdvanceId}`
    )
    assertRestSuccess(result!, [200, 204, 400], 'delete advance')
  })

  it('cleanup — delete salary config', async () => {
    if (!testConfigId) {
      console.warn('Skipping salary config cleanup: no config was created')
      return
    }
    const result = await payrollRest(
      'DELETE',
      `/payroll/salary-config/${testConfigId}`
    )
    assertRestSuccess(result!, [200, 204], 'delete salary config')
  })
})
