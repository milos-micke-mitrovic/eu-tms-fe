import { describe, it, expect } from 'vitest'
import { tachographEntrySchema } from './schemas'

describe('tachographEntrySchema', () => {
  const valid = {
    driverId: 1,
    entryDate: '2026-04-01',
    drivingMinutes: 540,
    restMinutes: 480,
    otherWorkMinutes: 300,
    availabilityMinutes: 120,
  }

  it('accepts valid data (total = 1440)', () => {
    expect(tachographEntrySchema.safeParse(valid).success).toBe(true)
  })

  it('rejects when total is not 1440', () => {
    expect(
      tachographEntrySchema.safeParse({
        ...valid,
        drivingMinutes: 100,
      }).success
    ).toBe(false)
  })

  it('rejects negative minutes', () => {
    expect(
      tachographEntrySchema.safeParse({
        ...valid,
        drivingMinutes: -10,
        restMinutes: 970,
      }).success
    ).toBe(false)
  })

  it('rejects minutes > 1440', () => {
    expect(
      tachographEntrySchema.safeParse({
        ...valid,
        drivingMinutes: 1441,
      }).success
    ).toBe(false)
  })

  it('accepts optional odometer fields', () => {
    expect(
      tachographEntrySchema.safeParse({
        ...valid,
        startOdometerKm: 100000,
        endOdometerKm: 100500,
      }).success
    ).toBe(true)
  })

  it('accepts optional notes', () => {
    expect(
      tachographEntrySchema.safeParse({
        ...valid,
        notes: 'Test note',
      }).success
    ).toBe(true)
  })
})
