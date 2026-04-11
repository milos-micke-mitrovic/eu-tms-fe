import { describe, it, expect } from 'vitest'
import {
  FUEL_CONSUMPTION_TREND,
  FUEL_CONSUMPTION_ALL_VEHICLES,
  DRIVER_FUEL_COMPARISON,
  COST_PER_KM,
  VEHICLE_UTILIZATION,
  TOP_PROFITABLE_ROUTES,
  MONTHLY_PNL,
  AGING_ANALYSIS,
  TOP_DEBTORS,
  ROUTE_COUNT_BY_PARTNER,
  DRIVER_PRODUCTIVITY,
} from './use-advanced-stats'

describe('Advanced statistics GraphQL queries', () => {
  it('FUEL_CONSUMPTION_TREND includes vehicleId and date vars', () => {
    const q = FUEL_CONSUMPTION_TREND.loc?.source.body ?? ''
    expect(q).toContain('vehicleId')
    expect(q).toContain('from')
    expect(q).toContain('avgLitersPer100km')
  })

  it('FUEL_CONSUMPTION_ALL_VEHICLES includes all vehicle fields', () => {
    const q = FUEL_CONSUMPTION_ALL_VEHICLES.loc?.source.body ?? ''
    expect(q).toContain('fuelConsumptionAllVehicles')
    expect(q).toContain('regNumber')
    expect(q).toContain('month')
  })

  it('DRIVER_FUEL_COMPARISON includes driver fields', () => {
    const q = DRIVER_FUEL_COMPARISON.loc?.source.body ?? ''
    expect(q).toContain('driverName')
    expect(q).toContain('avgLitersPer100km')
    expect(q).toContain('totalKm')
    expect(q).toContain('totalLiters')
  })

  it('COST_PER_KM includes cost fields', () => {
    const q = COST_PER_KM.loc?.source.body ?? ''
    expect(q).toContain('costPerKmRsd')
    expect(q).toContain('totalExpenseRsd')
    expect(q).toContain('totalDistanceKm')
  })

  it('VEHICLE_UTILIZATION includes utilization fields', () => {
    const q = VEHICLE_UTILIZATION.loc?.source.body ?? ''
    expect(q).toContain('daysOnRoad')
    expect(q).toContain('daysInPeriod')
    expect(q).toContain('utilizationPercent')
  })

  it('TOP_PROFITABLE_ROUTES includes profit fields', () => {
    const q = TOP_PROFITABLE_ROUTES.loc?.source.body ?? ''
    expect(q).toContain('limit')
    expect(q).toContain('revenue')
    expect(q).toContain('profit')
    expect(q).toContain('marginPercent')
  })

  it('MONTHLY_PNL includes revenue/expenses/profit', () => {
    const q = MONTHLY_PNL.loc?.source.body ?? ''
    expect(q).toContain('revenue')
    expect(q).toContain('expenses')
    expect(q).toContain('profit')
    expect(q).toContain('month')
  })

  it('AGING_ANALYSIS has no date params', () => {
    const q = AGING_ANALYSIS.loc?.source.body ?? ''
    expect(q).toContain('agingAnalysis')
    expect(q).toContain('bucket')
    expect(q).toContain('invoiceCount')
    expect(q).toContain('totalAmount')
    expect(q).not.toContain('$from')
  })

  it('TOP_DEBTORS includes debtor fields', () => {
    const q = TOP_DEBTORS.loc?.source.body ?? ''
    expect(q).toContain('partnerName')
    expect(q).toContain('totalDebt')
    expect(q).toContain('oldestDueDate')
    expect(q).toContain('avgDaysOverdue')
  })

  it('ROUTE_COUNT_BY_PARTNER includes partner fields', () => {
    const q = ROUTE_COUNT_BY_PARTNER.loc?.source.body ?? ''
    expect(q).toContain('partnerName')
    expect(q).toContain('routeCount')
    expect(q).toContain('totalRevenue')
  })

  it('DRIVER_PRODUCTIVITY includes productivity fields', () => {
    const q = DRIVER_PRODUCTIVITY.loc?.source.body ?? ''
    expect(q).toContain('driverName')
    expect(q).toContain('routeCount')
    expect(q).toContain('totalProfit')
    expect(q).toContain('daysOnRoad')
  })
})
