import { describe, it, expect } from 'vitest'
import { graphql, rest } from './helpers'

describe('Statistics API', () => {
  const from = '2026-01-01'
  const to = '2026-12-31'

  it('GraphQL — profitability by route', async () => {
    const res = await graphql(
      `
        query ($from: Date!, $to: Date!) {
          profitabilityByRoute(from: $from, to: $to, page: 0, size: 5) {
            content {
              routeId
              internalNumber
              partnerName
              vehicleRegNumber
              revenue
              expenses
              profit
              marginPercent
            }
            totalPages
            totalElements
          }
        }
      `,
      { from, to }
    )
    if (!res.data?.profitabilityByRoute) return
    const result = res.data.profitabilityByRoute
    expect(Array.isArray(result.content)).toBe(true)
    expect(typeof result.totalElements).toBe('number')

    if (result.content.length > 0) {
      const r = result.content[0]
      expect(typeof r.revenue).toBe('number')
      expect(typeof r.expenses).toBe('number')
      expect(typeof r.profit).toBe('number')
      expect(typeof r.marginPercent).toBe('number')
    }
  })

  it('GraphQL — profitability by vehicle', async () => {
    const res = await graphql(
      `
        query ($from: Date!, $to: Date!) {
          profitabilityByVehicle(from: $from, to: $to) {
            vehicleId
            regNumber
            routeCount
            totalRevenue
            totalExpenses
            profit
            avgProfitPerRoute
          }
        }
      `,
      { from, to }
    )
    if (!res.data?.profitabilityByVehicle) return
    const vehicles = res.data.profitabilityByVehicle
    expect(Array.isArray(vehicles)).toBe(true)

    if (vehicles.length > 0) {
      const v = vehicles[0]
      expect(v).toHaveProperty('vehicleId')
      expect(v).toHaveProperty('regNumber')
      expect(typeof v.profit).toBe('number')
    }
  })

  it('GraphQL — profitability by partner', async () => {
    const res = await graphql(
      `
        query ($from: Date!, $to: Date!) {
          profitabilityByPartner(from: $from, to: $to) {
            partnerId
            partnerName
            routeCount
            totalRevenue
            totalExpenses
            profit
          }
        }
      `,
      { from, to }
    )
    if (!res.data?.profitabilityByPartner) return
    const partners = res.data.profitabilityByPartner
    expect(Array.isArray(partners)).toBe(true)

    if (partners.length > 0) {
      const p = partners[0]
      expect(p).toHaveProperty('partnerId')
      expect(p).toHaveProperty('partnerName')
      expect(typeof p.profit).toBe('number')
    }
  })

  it('GraphQL — invoice collection stats', async () => {
    const res = await graphql(
      `
        query ($from: Date!, $to: Date!) {
          invoiceCollectionStats(from: $from, to: $to) {
            totalInvoiced
            totalCollected
            totalOverdue
            collectionRate
            avgCollectionDays
            overdueCount
          }
        }
      `,
      { from, to }
    )
    if (!res.data?.invoiceCollectionStats) return
    const stats = res.data.invoiceCollectionStats
    expect(typeof stats.totalInvoiced).toBe('number')
    expect(typeof stats.totalCollected).toBe('number')
    expect(typeof stats.collectionRate).toBe('number')
    expect(typeof stats.overdueCount).toBe('number')
  })
})

describe('Reports API', () => {
  it('REST — expense report PDF download', async () => {
    const { status } = await rest(
      'GET',
      '/reports/expenses?format=pdf&from=2026-01-01&to=2026-04-11'
    )
    expect([200, 204]).toContain(status)
  })

  it('REST — expense report Excel download', async () => {
    const { status } = await rest(
      'GET',
      '/reports/expenses?format=xlsx&from=2026-01-01&to=2026-04-11'
    )
    expect([200, 204]).toContain(status)
  })

  it('REST — profitability report', async () => {
    const { status } = await rest(
      'GET',
      '/reports/profitability?format=pdf&from=2026-01-01&to=2026-04-11&groupBy=route'
    )
    expect([200, 204]).toContain(status)
  })

  it('REST — fleet costs report', async () => {
    const { status } = await rest(
      'GET',
      '/reports/fleet-costs?format=xlsx&from=2026-01-01&to=2026-04-11'
    )
    expect([200, 204]).toContain(status)
  })
})
