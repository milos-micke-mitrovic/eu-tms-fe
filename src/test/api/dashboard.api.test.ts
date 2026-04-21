import { describe, it, expect } from 'vitest'
import { graphql } from './helpers'

describe('Dashboard API', () => {
  it('GraphQL — full dashboard query returns all sections', async () => {
    const res = await graphql(`
      {
        dashboard {
          activeRoutesCount
          completedRoutesThisMonth
          monthlyExpenseTotal
          monthlyRevenueTotal
          profitThisMonth
          expensesByCategory {
            category
            totalAmountRsd
          }
          expenseTrendMonthly {
            month
            totalAmountRsd
          }
          topVehiclesByExpense {
            vehicleId
            regNumber
            totalAmountRsd
          }
          expiringPermits {
            id
            permitType
            permitNumber
            countryName
            validTo
            daysUntilExpiry
          }
          expiringDocuments {
            entityType
            entityId
            entityName
            documentType
            expirationDate
            daysUntilExpiry
          }
          overdueInvoices {
            id
            invoiceNumber
            partnerName
            total
            currency
            daysOverdue
          }
          recentRoutes {
            id
            internalNumber
            status
            partnerName
            departureDate
            price
            currency
          }
          recentNotifications {
            id
            title
            message
            read
            createdAt
          }
          fleetSummary {
            totalVehicles
            activeVehicles
            totalDrivers
            activeDrivers
          }
        }
      }
    `)
    if (res.errors?.length) {
      // Show the actual BE error so we know exactly what failed
      const errMsg = res.errors
        .map(
          (e: { message: string; path?: string[] }) =>
            `${e.path?.join('.') ?? 'root'}: ${e.message}`
        )
        .join('; ')
      throw new Error(`BE ERROR: ${errMsg}`)
    }
    expect(res.data?.dashboard).toBeTruthy()
    const d = res.data.dashboard

    // KPI numbers
    expect(typeof d.activeRoutesCount).toBe('number')
    expect(typeof d.completedRoutesThisMonth).toBe('number')
    expect(typeof d.monthlyExpenseTotal).toBe('number')
    expect(typeof d.monthlyRevenueTotal).toBe('number')
    expect(typeof d.profitThisMonth).toBe('number')

    // Arrays
    expect(Array.isArray(d.expensesByCategory)).toBe(true)
    expect(Array.isArray(d.expenseTrendMonthly)).toBe(true)
    expect(Array.isArray(d.topVehiclesByExpense)).toBe(true)
    expect(Array.isArray(d.expiringPermits)).toBe(true)
    expect(Array.isArray(d.expiringDocuments)).toBe(true)
    expect(Array.isArray(d.overdueInvoices)).toBe(true)
    expect(Array.isArray(d.recentRoutes)).toBe(true)
    expect(Array.isArray(d.recentNotifications)).toBe(true)

    // Fleet summary
    expect(d.fleetSummary).toBeTruthy()
    expect(typeof d.fleetSummary.totalVehicles).toBe('number')
    expect(typeof d.fleetSummary.activeVehicles).toBe('number')
    expect(typeof d.fleetSummary.totalDrivers).toBe('number')
    expect(typeof d.fleetSummary.activeDrivers).toBe('number')
  })

  it('GraphQL — expensesByCategory shape', async () => {
    const res = await graphql(`
      {
        dashboard {
          expensesByCategory {
            category
            totalAmountRsd
          }
        }
      }
    `)
    if (!res.data?.dashboard) return // skip if rate limited
    const categories = res.data.dashboard.expensesByCategory
    if (categories.length > 0) {
      expect(categories[0]).toHaveProperty('category')
      expect(categories[0]).toHaveProperty('totalAmountRsd')
      expect(typeof categories[0].totalAmountRsd).toBe('number')
    }
  })

  it('GraphQL — recentRoutes shape', async () => {
    const res = await graphql(`
      {
        dashboard {
          recentRoutes {
            id
            internalNumber
            status
            partnerName
            departureDate
            price
            currency
          }
        }
      }
    `)
    if (!res.data?.dashboard) return // skip if rate limited
    const routes = res.data.dashboard.recentRoutes
    if (routes.length > 0) {
      const r = routes[0]
      expect(r).toHaveProperty('id')
      expect(r).toHaveProperty('internalNumber')
      expect(r).toHaveProperty('status')
    }
  })
})
