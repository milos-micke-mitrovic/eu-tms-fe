import { describe, it, expect } from 'vitest'
import { permitSchema, permitAssignSchema } from './schemas'

describe('permitSchema', () => {
  const valid = {
    permitType: 'BILATERAL',
    permitNumber: 'SRB-DE-2026-001',
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
  }

  it('accepts valid data', () => {
    expect(permitSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects empty permitNumber', () => {
    expect(permitSchema.safeParse({ ...valid, permitNumber: '' }).success).toBe(
      false
    )
  })

  it('rejects empty validFrom', () => {
    expect(permitSchema.safeParse({ ...valid, validFrom: '' }).success).toBe(
      false
    )
  })

  it('rejects empty validTo', () => {
    expect(permitSchema.safeParse({ ...valid, validTo: '' }).success).toBe(
      false
    )
  })

  it('rejects invalid permitType', () => {
    expect(
      permitSchema.safeParse({ ...valid, permitType: 'INVALID' }).success
    ).toBe(false)
  })

  it('accepts all valid permitTypes', () => {
    for (const t of ['CEMT', 'BILATERAL', 'ECMT']) {
      expect(permitSchema.safeParse({ ...valid, permitType: t }).success).toBe(
        true
      )
    }
  })

  it('accepts optional fields as null', () => {
    expect(
      permitSchema.safeParse({
        ...valid,
        countryCode: null,
        countryName: null,
        notes: null,
      }).success
    ).toBe(true)
  })
})

describe('permitAssignSchema', () => {
  it('accepts valid vehicleId', () => {
    expect(permitAssignSchema.safeParse({ vehicleId: 1 }).success).toBe(true)
  })

  it('rejects missing vehicleId', () => {
    expect(permitAssignSchema.safeParse({}).success).toBe(false)
  })

  it('accepts optional routeId', () => {
    expect(
      permitAssignSchema.safeParse({ vehicleId: 1, routeId: 5 }).success
    ).toBe(true)
  })

  it('accepts null routeId', () => {
    expect(
      permitAssignSchema.safeParse({ vehicleId: 1, routeId: null }).success
    ).toBe(true)
  })
})
