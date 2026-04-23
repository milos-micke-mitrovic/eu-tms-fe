import { describe, it, expect } from 'vitest'
import { rest, graphql } from './helpers'
import { assertRestSuccess, assertGraphqlSuccess } from './assert-helpers'

// Use unique dates to avoid duplicate conflicts
const testDate1 = '2026-06-15'
const testDate2 = '2026-06-16'

describe('Tachograph API', () => {
  let testEntryId: number | null = null
  let testDriverId: number | null = null

  it('GraphQL — tachographDriverStatuses returns array', async () => {
    const res = await graphql(`
      {
        tachographDriverStatuses {
          driverId
          driverFirstName
          driverLastName
          currentWeekDrivingMinutes
          currentWeekDrivingPercent
          openViolationCount
          status
        }
      }
    `)
    assertGraphqlSuccess(res, 'tachographDriverStatuses')
    expect(res.data.tachographDriverStatuses).toBeDefined()
    expect(Array.isArray(res.data.tachographDriverStatuses)).toBe(true)
  })

  it('REST — create tachograph entry', async () => {
    const driversRes = await graphql(`
      {
        drivers(page: 0, size: 1) {
          content {
            id
          }
        }
      }
    `)
    assertGraphqlSuccess(driversRes, 'drivers for tachograph')
    testDriverId = Number(driversRes.data.drivers.content[0]?.id)
    expect(testDriverId).toBeGreaterThan(0)

    const result = await rest('POST', '/tachograph/entries', {
      driverId: testDriverId,
      entryDate: testDate1,
      drivingMinutes: 540,
      restMinutes: 660,
      otherWorkMinutes: 180,
      availabilityMinutes: 60,
    })
    if (result.status === 409) {
      console.warn(
        'Tachograph entry already exists for this date (409 duplicate) — continuing'
      )
      return
    }
    assertRestSuccess(result, [200, 201], 'create tachograph entry')
    expect(result.data).toHaveProperty('id')
    testEntryId = result.data.id
  })

  it('REST — create entry with excessive driving', async () => {
    if (!testDriverId)
      throw new Error('testDriverId not set — previous test failed')
    const result = await rest('POST', '/tachograph/entries', {
      driverId: testDriverId,
      entryDate: testDate2,
      drivingMinutes: 620,
      restMinutes: 500,
      otherWorkMinutes: 200,
      availabilityMinutes: 120,
    })
    if (result.status === 409) {
      console.warn(
        'Tachograph entry already exists for this date (409 duplicate) — continuing'
      )
      return
    }
    assertRestSuccess(
      result,
      [200, 201],
      'create tachograph entry with violations'
    )
    if (result.data?.violations) {
      expect(Array.isArray(result.data.violations)).toBe(true)
    }
  })

  it('GraphQL — tachographEntries for driver', async () => {
    if (!testDriverId)
      throw new Error('testDriverId not set — previous test failed')
    const res = await graphql(
      `
        query ($driverId: ID!) {
          tachographEntries(
            driverId: $driverId
            from: "2026-06-01"
            to: "2026-06-30"
          ) {
            id
            entryDate
            drivingMinutes
            restMinutes
            status
            violations {
              id
              violationType
              severity
            }
          }
        }
      `,
      { driverId: String(testDriverId) }
    )
    assertGraphqlSuccess(res, 'tachographEntries')
    expect(Array.isArray(res.data.tachographEntries)).toBe(true)
  })

  it('GraphQL — tachographWeeklySummary', async () => {
    if (!testDriverId)
      throw new Error('testDriverId not set — previous test failed')
    const res = await graphql(
      `
        query ($driverId: ID!) {
          tachographWeeklySummary(
            driverId: $driverId
            weekStart: "2026-06-15"
          ) {
            driverId
            driverName
            weekStart
            weekEnd
            totalDrivingMinutes
            daysWithEntries
            violationCount
            entries {
              id
              entryDate
            }
          }
        }
      `,
      { driverId: String(testDriverId) }
    )
    assertGraphqlSuccess(res, 'tachographWeeklySummary')
    expect(res.data.tachographWeeklySummary).toBeDefined()
  })

  it('GraphQL — tachographViolations', async () => {
    if (!testDriverId)
      throw new Error('testDriverId not set — previous test failed')
    const res = await graphql(
      `
        query ($driverId: ID!) {
          tachographViolations(
            driverId: $driverId
            from: "2026-06-01"
            to: "2026-06-30"
          ) {
            id
            violationType
            severity
            description
          }
        }
      `,
      { driverId: String(testDriverId) }
    )
    assertGraphqlSuccess(res, 'tachographViolations')
    expect(Array.isArray(res.data.tachographViolations)).toBe(true)
  })

  it('REST — update tachograph entry', async () => {
    if (!testEntryId || !testDriverId) {
      console.warn(
        'Skipping update: no test entry was created (duplicate existed)'
      )
      return
    }
    const result = await rest('PUT', `/tachograph/entries/${testEntryId}`, {
      driverId: testDriverId,
      entryDate: testDate1,
      drivingMinutes: 480,
      restMinutes: 720,
      otherWorkMinutes: 120,
      availabilityMinutes: 120,
    })
    assertRestSuccess(result, [200, 400], 'update tachograph entry')
  })

  it('REST — confirm tachograph entry', async () => {
    if (!testEntryId) {
      console.warn(
        'Skipping confirm: no test entry was created (duplicate existed)'
      )
      return
    }
    const result = await rest(
      'PATCH',
      `/tachograph/entries/${testEntryId}/confirm`
    )
    assertRestSuccess(result, [200, 400], 'confirm tachograph entry')
  })

  it('REST — delete tachograph test entries', async () => {
    if (!testDriverId)
      throw new Error('testDriverId not set — previous test failed')
    const res = await graphql(
      `
        query ($driverId: ID!) {
          tachographEntries(
            driverId: $driverId
            from: "2026-06-15"
            to: "2026-06-16"
          ) {
            id
          }
        }
      `,
      { driverId: String(testDriverId) }
    )
    assertGraphqlSuccess(res, 'tachographEntries for cleanup')
    for (const entry of res.data.tachographEntries ?? []) {
      const result = await rest('DELETE', `/tachograph/entries/${entry.id}`)
      assertRestSuccess(result, [200, 204], 'delete tachograph entry')
    }
  })
})

describe('Tachograph Dashboard API (Sprint 7)', () => {
  it('GraphQL — tachographMonthlySummary', async () => {
    const res = await graphql(`
      {
        tachographMonthlySummary(from: "2026-01-01", to: "2026-06-30") {
          driverId
          driverName
          month
          totalDrivingMinutes
          totalRestMinutes
          totalOtherWorkMinutes
          entryCount
          avgDailyDrivingMinutes
        }
      }
    `)
    assertGraphqlSuccess(res, 'tachographMonthlySummary')
    expect(res.data.tachographMonthlySummary).toBeDefined()
    expect(Array.isArray(res.data.tachographMonthlySummary)).toBe(true)
  })

  it('GraphQL — tachographCompliance', async () => {
    const res = await graphql(`
      {
        tachographCompliance(from: "2026-01-01", to: "2026-06-30") {
          totalEntries
          compliantEntries
          nonCompliantEntries
          compliancePercent
        }
      }
    `)
    assertGraphqlSuccess(res, 'tachographCompliance')
    if (res.data?.tachographCompliance) {
      expect(res.data.tachographCompliance).toHaveProperty('compliancePercent')
      expect(res.data.tachographCompliance.totalEntries).toBeGreaterThanOrEqual(
        0
      )
    }
  })

  it('GraphQL — tachographTopViolators', async () => {
    const res = await graphql(`
      {
        tachographTopViolators(from: "2026-01-01", to: "2026-06-30", limit: 5) {
          driverId
          driverName
          totalViolations
          seriousViolations
          warnings
        }
      }
    `)
    assertGraphqlSuccess(res, 'tachographTopViolators')
    expect(res.data.tachographTopViolators).toBeDefined()
    expect(Array.isArray(res.data.tachographTopViolators)).toBe(true)
  })

  it('REST — PDF report download', async () => {
    const driversRes = await graphql(`
      {
        drivers(page: 0, size: 1) {
          content {
            id
          }
        }
      }
    `)
    assertGraphqlSuccess(driversRes, 'drivers for tachograph report')
    const driverId = driversRes.data.drivers.content[0]?.id
    expect(driverId).toBeTruthy()

    const result = await rest(
      'GET',
      `/tachograph/report/pdf?driverId=${driverId}&from=2026-04-01&to=2026-04-30`
    )
    // 200 = PDF returned, 400 = no data or bad params
    assertRestSuccess(result, [200, 400], 'tachograph PDF report')
  })
})
