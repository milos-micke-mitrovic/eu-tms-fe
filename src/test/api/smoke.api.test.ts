import { describe, it, expect } from 'vitest'
import { rest, graphql } from './helpers'
import { assertRestSuccess, assertGraphqlSuccess } from './assert-helpers'

/**
 * FE Route Smoke Tests
 *
 * Each test represents a page in the FE app and verifies that the queries
 * it depends on return data successfully. If a test fails, the corresponding
 * page in the app would crash or show an error state.
 */
describe('FE Route Smoke Tests', () => {
  it('Dashboard page — all data loads', async () => {
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
            daysUntilExpiry
          }
          expiringDocuments {
            entityType
            entityName
            daysUntilExpiry
          }
          overdueInvoices {
            id
            invoiceNumber
            daysOverdue
          }
          recentRoutes {
            id
            internalNumber
            status
          }
          recentNotifications {
            id
            title
            read
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
    assertGraphqlSuccess(res, 'Dashboard page')
    expect(res.data.dashboard).toBeTruthy()
  })

  it('Routes page — list loads', async () => {
    const res = await graphql(`
      {
        routes(page: 0, size: 10) {
          content {
            id
            internalNumber
            routeType
            status
            price
            currency
          }
          totalElements
          totalPages
        }
      }
    `)
    assertGraphqlSuccess(res, 'Routes page')
    expect(res.data.routes).toBeTruthy()
    expect(Array.isArray(res.data.routes.content)).toBe(true)
  })

  it('Vehicles page — list loads', async () => {
    const res = await graphql(`
      {
        vehicles(page: 0, size: 10) {
          content {
            id
            regNumber
            make
            model
            status
          }
          totalElements
          totalPages
        }
      }
    `)
    assertGraphqlSuccess(res, 'Vehicles page')
    expect(res.data.vehicles).toBeTruthy()
    expect(Array.isArray(res.data.vehicles.content)).toBe(true)
  })

  it('Drivers page — list loads', async () => {
    const res = await graphql(`
      {
        drivers(page: 0, size: 10) {
          content {
            id
            firstName
            lastName
            status
          }
          totalElements
          totalPages
        }
      }
    `)
    assertGraphqlSuccess(res, 'Drivers page')
    expect(res.data.drivers).toBeTruthy()
    expect(Array.isArray(res.data.drivers.content)).toBe(true)
  })

  it('Trailers page — list loads', async () => {
    const res = await graphql(`
      {
        trailers(page: 0, size: 10) {
          content {
            id
            regNumber
            type
            status
          }
          totalElements
          totalPages
        }
      }
    `)
    assertGraphqlSuccess(res, 'Trailers page')
    expect(res.data.trailers).toBeTruthy()
    expect(Array.isArray(res.data.trailers.content)).toBe(true)
  })

  it('Partners page — list loads', async () => {
    const res = await graphql(`
      {
        partners(page: 0, size: 10) {
          content {
            id
            name
            partnerType
            city
          }
          totalElements
          totalPages
        }
      }
    `)
    assertGraphqlSuccess(res, 'Partners page')
    expect(res.data.partners).toBeTruthy()
    expect(Array.isArray(res.data.partners.content)).toBe(true)
  })

  it('Fuel page — tanks load', async () => {
    const res = await graphql(`
      {
        fuelTanks {
          id
          name
          capacityLiters
          currentLevelLiters
          fuelType
          percentFull
        }
      }
    `)
    assertGraphqlSuccess(res, 'Fuel page')
    expect(Array.isArray(res.data.fuelTanks)).toBe(true)
  })

  it('Invoices page — list loads', async () => {
    const res = await graphql(`
      {
        invoices(page: 0, size: 10) {
          content {
            id
            invoiceNumber
            paymentStatus
          }
          totalElements
          totalPages
        }
      }
    `)
    assertGraphqlSuccess(res, 'Invoices page')
    expect(res.data.invoices).toBeTruthy()
    expect(Array.isArray(res.data.invoices.content)).toBe(true)
  })

  it('Exchange rates page — data loads', async () => {
    const res = await graphql(`
      {
        exchangeRates(date: "2026-04-10") {
          currencyCode
          rateToRsd
          rateDate
        }
      }
    `)
    assertGraphqlSuccess(res, 'Exchange rates page')
    expect(Array.isArray(res.data.exchangeRates)).toBe(true)
  })

  it('Permits page — list loads', async () => {
    const result = await rest('GET', '/permits?page=0&size=10')
    assertRestSuccess(result, [200], 'Permits page')
    expect(Array.isArray(result.data.content)).toBe(true)
  })

  it('Notifications — list loads', async () => {
    const result = await rest('GET', '/notifications?page=0&size=10')
    assertRestSuccess(result, [200], 'Notifications')
    expect(Array.isArray(result.data.content)).toBe(true)
  })

  it('Statistics page — profitability by route loads', async () => {
    const res = await graphql(`
      {
        profitabilityByRoute(
          from: "2026-01-01"
          to: "2026-12-31"
          page: 0
          size: 5
        ) {
          content {
            routeId
            internalNumber
            revenue
            expenses
            profit
            marginPercent
          }
          totalElements
        }
      }
    `)
    assertGraphqlSuccess(res, 'Statistics page — profitabilityByRoute')
    expect(res.data.profitabilityByRoute).toBeTruthy()
  })

  it('Statistics page — profitability by vehicle loads', async () => {
    const res = await graphql(`
      {
        profitabilityByVehicle(from: "2026-01-01", to: "2026-12-31") {
          vehicleId
          regNumber
          routeCount
          totalRevenue
          totalExpenses
          profit
        }
      }
    `)
    assertGraphqlSuccess(res, 'Statistics page — profitabilityByVehicle')
    expect(Array.isArray(res.data.profitabilityByVehicle)).toBe(true)
  })

  it('Statistics page — profitability by partner loads', async () => {
    const res = await graphql(`
      {
        profitabilityByPartner(from: "2026-01-01", to: "2026-12-31") {
          partnerId
          partnerName
          routeCount
          totalRevenue
          totalExpenses
          profit
        }
      }
    `)
    assertGraphqlSuccess(res, 'Statistics page — profitabilityByPartner')
    expect(Array.isArray(res.data.profitabilityByPartner)).toBe(true)
  })

  it('Statistics page — invoice collection stats load', async () => {
    const res = await graphql(`
      {
        invoiceCollectionStats(from: "2026-01-01", to: "2026-12-31") {
          totalInvoiced
          totalCollected
          totalOverdue
          collectionRate
          overdueCount
        }
      }
    `)
    assertGraphqlSuccess(res, 'Statistics page — invoiceCollectionStats')
    expect(res.data.invoiceCollectionStats).toBeTruthy()
  })

  it('Tachograph page — driver statuses load', async () => {
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
    assertGraphqlSuccess(res, 'Tachograph page — driver statuses')
    expect(Array.isArray(res.data.tachographDriverStatuses)).toBe(true)
  })

  it('Tachograph page — compliance loads', async () => {
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
    assertGraphqlSuccess(res, 'Tachograph page — compliance')
  })

  it('Tachograph page — top violators load', async () => {
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
    assertGraphqlSuccess(res, 'Tachograph page — top violators')
    expect(Array.isArray(res.data.tachographTopViolators)).toBe(true)
  })

  it('Tachograph page — monthly summary loads', async () => {
    const res = await graphql(`
      {
        tachographMonthlySummary(from: "2026-01-01", to: "2026-06-30") {
          driverId
          driverName
          month
          totalDrivingMinutes
          entryCount
        }
      }
    `)
    assertGraphqlSuccess(res, 'Tachograph page — monthly summary')
    expect(Array.isArray(res.data.tachographMonthlySummary)).toBe(true)
  })

  it.skip('Payroll page — monthly payroll loads (SPEDITER role has no access)', async () => {
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
    // SPEDITER role may not have access
    if (
      res.errors?.some(
        (e: { extensions?: { classification?: string } }) =>
          e.extensions?.classification === 'FORBIDDEN'
      )
    ) {
      console.warn(
        'Payroll page: FORBIDDEN for current role — expected for non-ACCOUNTING users'
      )
      return
    }
    assertGraphqlSuccess(res, 'Payroll page')
  })

  it('Collections page — dashboard loads', async () => {
    const res = await graphql(`
      {
        collectionDashboard {
          totalReceivables
          totalOverdue
          collectedThisMonth
          collectionRate
          overdueInvoiceCount
          remindersThisMonth
          agingBuckets {
            bucket
            invoiceCount
            totalAmount
            currency
          }
        }
      }
    `)
    assertGraphqlSuccess(res, 'Collections page — dashboard')
    expect(res.data.collectionDashboard).toBeTruthy()
  })

  it('Collections page — debtors load', async () => {
    const res = await graphql(`
      {
        debtorsSummary(limit: 10) {
          partnerId
          partnerName
          totalInvoices
          overdueInvoices
          totalDebt
        }
      }
    `)
    assertGraphqlSuccess(res, 'Collections page — debtors')
    expect(Array.isArray(res.data.debtorsSummary)).toBe(true)
  })

  it('Per diem rates page — rates load', async () => {
    const res = await graphql(`
      {
        perDiemRates {
          countryCode
          countryNameSr
          dailyAmount
          currency
        }
      }
    `)
    assertGraphqlSuccess(res, 'Per diem rates page')
    expect(Array.isArray(res.data.perDiemRates)).toBe(true)
  })

  it('Expiring documents — data loads', async () => {
    const res = await graphql(`
      {
        expiringDocuments(days: 30) {
          entityType
          entityName
          documentType
          expirationDate
          daysUntilExpiry
        }
      }
    `)
    assertGraphqlSuccess(res, 'Expiring documents')
    expect(Array.isArray(res.data.expiringDocuments)).toBe(true)
  })

  it('Expense summary — data loads', async () => {
    const res = await graphql(`
      {
        expenseSummary(
          from: "2026-01-01"
          to: "2026-12-31"
          groupBy: "CATEGORY"
        ) {
          key
          totalAmountRsd
        }
      }
    `)
    assertGraphqlSuccess(res, 'Expense summary')
    expect(Array.isArray(res.data.expenseSummary)).toBe(true)
  })
})
