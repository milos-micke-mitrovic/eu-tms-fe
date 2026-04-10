import { describe, it, expect } from 'vitest'
import type * as Gen from './graphql'

// Verify manually-written types match auto-generated types from BE schema.
// Run `pnpm codegen` after any BE schema change, then `pnpm test:unit`.

describe('Generated types match BE schema', () => {
  it('Vehicle has all expected fields', () => {
    // Type-level check — if this compiles, the fields exist
    const v: Gen.Vehicle = {
      id: '1',
      regNumber: 'BG-001',
      make: 'Scania',
      model: 'R450',
      vehicleType: 'TRUCK',
      fuelType: 'DIESEL',
      ownership: 'OWNED',
      status: 'ACTIVE',
      documents: [],
      year: null,
      vin: null,
      cargoCapacityKg: null,
      cargoVolumeM3: null,
      avgConsumptionL100km: null,
      odometerKm: null,
      currentDriverId: null,
      currentDriverName: null,
      createdAt: null,
      updatedAt: null,
    }
    expect(v.regNumber).toBe('BG-001')
  })

  it('Route has nested partner, vehicle, driver, stops, expenses', () => {
    const r: Gen.Route = {
      id: '1',
      internalNumber: 'RT-2026-0001',
      routeType: 'INTERNATIONAL',
      status: 'CREATED',
      currency: 'EUR',
      stops: [],
      expenses: [],
      partnerId: null,
      partner: null,
      vehicleId: null,
      vehicle: null,
      driverId: null,
      driver: null,
      trailerId: null,
      departureDate: null,
      returnDate: null,
      cargoDescription: null,
      cargoWeightKg: null,
      cargoVolumeM3: null,
      price: null,
      distanceKm: null,
      notes: null,
      totalExpenseRsd: null,
      profit: null,
      createdAt: null,
      updatedAt: null,
    }
    expect(r.internalNumber).toBe('RT-2026-0001')
  })

  it('RouteExpense has exchangeRate and amountRsd', () => {
    const e: Gen.RouteExpense = {
      id: '1',
      category: 'FUEL',
      amount: 320,
      currency: 'EUR',
      exchangeRate: 117.5,
      amountRsd: 37600,
      expenseDate: '2026-04-10',
      status: 'MANUAL',
      description: null,
      createdAt: null,
    }
    expect(e.amountRsd).toBe(37600)
  })

  it('FuelTank has percentFull', () => {
    const t: Gen.FuelTank = {
      id: '1',
      name: 'Main',
      capacityLiters: 5000,
      currentLevelLiters: 2500,
      fuelType: 'DIESEL',
      percentFull: 50,
      location: null,
      createdAt: null,
    }
    expect(t.percentFull).toBe(50)
  })

  it('ExpenseSummaryItem has key + totalAmountRsd', () => {
    const s: Gen.ExpenseSummaryItem = { key: 'FUEL', totalAmountRsd: 45000 }
    expect(s.key).toBe('FUEL')
  })

  it('RoutePage has pagination fields', () => {
    const p: Gen.RoutePage = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 20,
    }
    expect(p.totalPages).toBe(0)
  })

  it('ExpiringDocument has daysUntilExpiry', () => {
    const d: Gen.ExpiringDocument = {
      id: '1',
      entityType: 'VEHICLE',
      entityName: 'SC-001',
      documentType: 'REGISTRATION',
      expirationDate: '2026-05-01',
      daysUntilExpiry: 21,
    }
    expect(d.daysUntilExpiry).toBe(21)
  })
})
