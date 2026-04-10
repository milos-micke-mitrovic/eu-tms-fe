import { describe, it, expect } from 'vitest'
import { routeSchema, expenseSchema } from './schemas'

describe('routeSchema', () => {
  const valid = { routeType: 'INTERNATIONAL', partnerId: 1, cargoDescription: 'Electronics' }

  it('accepts valid data', () => {
    expect(routeSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects invalid routeType', () => {
    expect(routeSchema.safeParse({ ...valid, routeType: 'LOCAL' }).success).toBe(false)
  })

  it('rejects zero partnerId', () => {
    expect(routeSchema.safeParse({ ...valid, partnerId: 0 }).success).toBe(false)
  })

  it('rejects negative partnerId', () => {
    expect(routeSchema.safeParse({ ...valid, partnerId: -1 }).success).toBe(false)
  })

  it('rejects empty cargoDescription', () => {
    expect(routeSchema.safeParse({ ...valid, cargoDescription: '' }).success).toBe(false)
  })

  it('accepts both route types', () => {
    expect(routeSchema.safeParse({ ...valid, routeType: 'DOMESTIC' }).success).toBe(true)
    expect(routeSchema.safeParse({ ...valid, routeType: 'INTERNATIONAL' }).success).toBe(true)
  })

  it('accepts optional fields as null', () => {
    expect(routeSchema.safeParse({ ...valid, vehicleId: null, driverId: null, trailerId: null }).success).toBe(true)
  })

  it('rejects negative price', () => {
    expect(routeSchema.safeParse({ ...valid, price: -100 }).success).toBe(false)
  })

  it('accepts zero price', () => {
    expect(routeSchema.safeParse({ ...valid, price: 0 }).success).toBe(true)
  })

  it('defaults currency to EUR', () => {
    const result = routeSchema.safeParse(valid)
    expect(result.success && result.data.currency).toBe('EUR')
  })
})

describe('expenseSchema', () => {
  const valid = { category: 'FUEL', amount: 320, currency: 'EUR', expenseDate: '2026-04-09' }

  it('accepts valid data', () => {
    expect(expenseSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects empty category', () => {
    expect(expenseSchema.safeParse({ ...valid, category: '' }).success).toBe(false)
  })

  it('rejects zero amount', () => {
    expect(expenseSchema.safeParse({ ...valid, amount: 0 }).success).toBe(false)
  })

  it('rejects negative amount', () => {
    expect(expenseSchema.safeParse({ ...valid, amount: -50 }).success).toBe(false)
  })

  it('rejects empty expenseDate', () => {
    expect(expenseSchema.safeParse({ ...valid, expenseDate: '' }).success).toBe(false)
  })

  it('accepts optional exchangeRate', () => {
    expect(expenseSchema.safeParse({ ...valid, exchangeRate: 117.5 }).success).toBe(true)
    expect(expenseSchema.safeParse({ ...valid, exchangeRate: null }).success).toBe(true)
  })

  it('rejects negative exchangeRate', () => {
    expect(expenseSchema.safeParse({ ...valid, exchangeRate: -1 }).success).toBe(false)
  })

  it('defaults currency to RSD', () => {
    const result = expenseSchema.safeParse({ category: 'TOLL_DOMESTIC', amount: 500, expenseDate: '2026-04-09' })
    expect(result.success && result.data.currency).toBe('RSD')
  })
})
