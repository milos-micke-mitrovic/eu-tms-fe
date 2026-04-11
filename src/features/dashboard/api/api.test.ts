import { describe, it, expect } from 'vitest'
import { GET_DASHBOARD } from './use-dashboard'

describe('GraphQL queries - Dashboard', () => {
  it('GET_DASHBOARD includes KPI fields', () => {
    const query = GET_DASHBOARD.loc?.source.body ?? ''
    expect(query).toContain('query Dashboard')
    expect(query).toContain('activeRoutesCount')
    expect(query).toContain('completedRoutesThisMonth')
    expect(query).toContain('monthlyExpenseTotal')
    expect(query).toContain('monthlyRevenueTotal')
    expect(query).toContain('profitThisMonth')
  })

  it('GET_DASHBOARD includes expensesByCategory', () => {
    const query = GET_DASHBOARD.loc?.source.body ?? ''
    expect(query).toContain('expensesByCategory {')
    expect(query).toContain('category')
    expect(query).toContain('totalAmountRsd')
  })

  it('GET_DASHBOARD includes expenseTrendMonthly', () => {
    const query = GET_DASHBOARD.loc?.source.body ?? ''
    expect(query).toContain('expenseTrendMonthly {')
    expect(query).toContain('month')
    expect(query).toContain('totalAmountRsd')
  })

  it('GET_DASHBOARD includes topVehiclesByExpense', () => {
    const query = GET_DASHBOARD.loc?.source.body ?? ''
    expect(query).toContain('topVehiclesByExpense {')
    expect(query).toContain('vehicleId')
    expect(query).toContain('regNumber')
    expect(query).toContain('totalAmountRsd')
  })

  it('GET_DASHBOARD includes expiringPermits', () => {
    const query = GET_DASHBOARD.loc?.source.body ?? ''
    expect(query).toContain('expiringPermits {')
    expect(query).toContain('permitType')
    expect(query).toContain('permitNumber')
    expect(query).toContain('countryName')
    expect(query).toContain('validTo')
    expect(query).toContain('daysUntilExpiry')
  })

  it('GET_DASHBOARD includes expiringDocuments', () => {
    const query = GET_DASHBOARD.loc?.source.body ?? ''
    expect(query).toContain('expiringDocuments {')
    expect(query).toContain('entityType')
    expect(query).toContain('entityId')
    expect(query).toContain('entityName')
    expect(query).toContain('documentType')
    expect(query).toContain('expirationDate')
    expect(query).toContain('daysUntilExpiry')
  })

  it('GET_DASHBOARD includes overdueInvoices', () => {
    const query = GET_DASHBOARD.loc?.source.body ?? ''
    expect(query).toContain('overdueInvoices {')
    expect(query).toContain('invoiceNumber')
    expect(query).toContain('partnerName')
    expect(query).toContain('total')
    expect(query).toContain('currency')
    expect(query).toContain('daysOverdue')
  })

  it('GET_DASHBOARD includes recentRoutes', () => {
    const query = GET_DASHBOARD.loc?.source.body ?? ''
    expect(query).toContain('recentRoutes {')
    expect(query).toContain('internalNumber')
    expect(query).toContain('status')
    expect(query).toContain('partnerName')
    expect(query).toContain('departureDate')
    expect(query).toContain('price')
    expect(query).toContain('currency')
  })

  it('GET_DASHBOARD includes recentNotifications', () => {
    const query = GET_DASHBOARD.loc?.source.body ?? ''
    expect(query).toContain('recentNotifications {')
    expect(query).toContain('title')
    expect(query).toContain('message')
    expect(query).toContain('read')
    expect(query).toContain('createdAt')
  })

  it('GET_DASHBOARD includes fleetSummary', () => {
    const query = GET_DASHBOARD.loc?.source.body ?? ''
    expect(query).toContain('fleetSummary {')
    expect(query).toContain('totalVehicles')
    expect(query).toContain('activeVehicles')
    expect(query).toContain('totalDrivers')
    expect(query).toContain('activeDrivers')
  })
})
