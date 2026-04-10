import { describe, it, expect } from 'vitest'
import { tankSchema, transactionSchema } from './schemas'

describe('tankSchema', () => {
  const valid = { name: 'Glavna cisterna', capacityLiters: 5000, fuelType: 'DIESEL' }

  it('accepts valid data', () => {
    expect(tankSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects empty name', () => {
    expect(tankSchema.safeParse({ ...valid, name: '' }).success).toBe(false)
  })

  it('rejects zero capacity', () => {
    expect(tankSchema.safeParse({ ...valid, capacityLiters: 0 }).success).toBe(false)
  })

  it('rejects negative capacity', () => {
    expect(tankSchema.safeParse({ ...valid, capacityLiters: -100 }).success).toBe(false)
  })

  it('rejects empty fuelType', () => {
    expect(tankSchema.safeParse({ ...valid, fuelType: '' }).success).toBe(false)
  })

  it('accepts optional location', () => {
    expect(tankSchema.safeParse({ ...valid, location: 'Baza Beograd' }).success).toBe(true)
    expect(tankSchema.safeParse({ ...valid, location: null }).success).toBe(true)
  })
})

describe('transactionSchema', () => {
  const valid = { liters: 200, transactionDate: '2026-04-09' }

  it('accepts valid data', () => {
    expect(transactionSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects zero liters', () => {
    expect(transactionSchema.safeParse({ ...valid, liters: 0 }).success).toBe(false)
  })

  it('rejects negative liters', () => {
    expect(transactionSchema.safeParse({ ...valid, liters: -50 }).success).toBe(false)
  })

  it('rejects empty transactionDate', () => {
    expect(transactionSchema.safeParse({ ...valid, transactionDate: '' }).success).toBe(false)
  })

  it('accepts optional fields', () => {
    expect(transactionSchema.safeParse({ ...valid, pricePerLiter: null, vehicleId: null, odometerKm: null, notes: null }).success).toBe(true)
  })

  it('rejects negative odometer', () => {
    expect(transactionSchema.safeParse({ ...valid, odometerKm: -1 }).success).toBe(false)
  })

  it('accepts zero odometer', () => {
    expect(transactionSchema.safeParse({ ...valid, odometerKm: 0 }).success).toBe(true)
  })
})
