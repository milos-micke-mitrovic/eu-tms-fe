import { describe, it, expect } from 'vitest'
import {
  PROFITABILITY_BY_ROUTE,
  PROFITABILITY_BY_VEHICLE,
  PROFITABILITY_BY_PARTNER,
  INVOICE_COLLECTION_STATS,
} from './use-statistics'

describe('GraphQL queries - Reports', () => {
  it('PROFITABILITY_BY_ROUTE has date + pagination variables', () => {
    const query = PROFITABILITY_BY_ROUTE.loc?.source.body ?? ''
    expect(query).toContain('query ProfitabilityByRoute')
    expect(query).toContain('$from: Date!')
    expect(query).toContain('$to: Date!')
    expect(query).toContain('$page: Int')
    expect(query).toContain('$size: Int')
  })

  it('PROFITABILITY_BY_ROUTE has content fields + pagination', () => {
    const query = PROFITABILITY_BY_ROUTE.loc?.source.body ?? ''
    expect(query).toContain('content {')
    expect(query).toContain('routeId')
    expect(query).toContain('internalNumber')
    expect(query).toContain('partnerName')
    expect(query).toContain('vehicleRegNumber')
    expect(query).toContain('revenue')
    expect(query).toContain('expenses')
    expect(query).toContain('profit')
    expect(query).toContain('marginPercent')
    expect(query).toContain('totalPages')
    expect(query).toContain('totalElements')
  })

  it('PROFITABILITY_BY_VEHICLE has date variables + all fields', () => {
    const query = PROFITABILITY_BY_VEHICLE.loc?.source.body ?? ''
    expect(query).toContain('query ProfitabilityByVehicle')
    expect(query).toContain('$from: Date!')
    expect(query).toContain('$to: Date!')
    expect(query).toContain('vehicleId')
    expect(query).toContain('regNumber')
    expect(query).toContain('routeCount')
    expect(query).toContain('totalRevenue')
    expect(query).toContain('totalExpenses')
    expect(query).toContain('profit')
    expect(query).toContain('avgProfitPerRoute')
  })

  it('PROFITABILITY_BY_PARTNER has date variables + all fields', () => {
    const query = PROFITABILITY_BY_PARTNER.loc?.source.body ?? ''
    expect(query).toContain('query ProfitabilityByPartner')
    expect(query).toContain('$from: Date!')
    expect(query).toContain('$to: Date!')
    expect(query).toContain('partnerId')
    expect(query).toContain('partnerName')
    expect(query).toContain('routeCount')
    expect(query).toContain('totalRevenue')
    expect(query).toContain('totalExpenses')
    expect(query).toContain('profit')
  })

  it('INVOICE_COLLECTION_STATS has date variables + all stats fields', () => {
    const query = INVOICE_COLLECTION_STATS.loc?.source.body ?? ''
    expect(query).toContain('query InvoiceCollectionStats')
    expect(query).toContain('$from: Date!')
    expect(query).toContain('$to: Date!')
    expect(query).toContain('totalInvoiced')
    expect(query).toContain('totalCollected')
    expect(query).toContain('totalOverdue')
    expect(query).toContain('collectionRate')
    expect(query).toContain('avgCollectionDays')
    expect(query).toContain('overdueCount')
  })
})
