import { describe, it, expect } from 'vitest'
import { vehicleSchema, driverSchema, trailerSchema, documentUploadSchema } from './schemas'

describe('vehicleSchema', () => {
  const valid = { regNumber: 'BG-001-AA', make: 'Scania', model: 'R450', vehicleType: 'TRUCK', fuelType: 'DIESEL' }

  it('accepts valid data', () => {
    expect(vehicleSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects empty regNumber', () => {
    expect(vehicleSchema.safeParse({ ...valid, regNumber: '' }).success).toBe(false)
  })

  it('rejects empty make', () => {
    expect(vehicleSchema.safeParse({ ...valid, make: '' }).success).toBe(false)
  })

  it('rejects empty model', () => {
    expect(vehicleSchema.safeParse({ ...valid, model: '' }).success).toBe(false)
  })

  it('rejects invalid vehicleType', () => {
    expect(vehicleSchema.safeParse({ ...valid, vehicleType: 'BUS' }).success).toBe(false)
  })

  it('rejects invalid fuelType', () => {
    expect(vehicleSchema.safeParse({ ...valid, fuelType: 'HYDROGEN' }).success).toBe(false)
  })

  it('accepts all valid vehicleTypes', () => {
    for (const t of ['TRUCK', 'TRACTOR', 'TRAILER', 'SEMI_TRAILER']) {
      expect(vehicleSchema.safeParse({ ...valid, vehicleType: t }).success).toBe(true)
    }
  })

  it('accepts all valid fuelTypes', () => {
    for (const t of ['DIESEL', 'PETROL', 'LPG', 'CNG', 'ELECTRIC']) {
      expect(vehicleSchema.safeParse({ ...valid, fuelType: t }).success).toBe(true)
    }
  })

  it('accepts optional fields as null', () => {
    expect(vehicleSchema.safeParse({ ...valid, year: null, vin: null, ownership: null }).success).toBe(true)
  })

  it('rejects year out of range', () => {
    expect(vehicleSchema.safeParse({ ...valid, year: 1800 }).success).toBe(false)
    expect(vehicleSchema.safeParse({ ...valid, year: 2200 }).success).toBe(false)
  })

  it('rejects negative capacity', () => {
    expect(vehicleSchema.safeParse({ ...valid, cargoCapacityKg: -100 }).success).toBe(false)
  })
})

describe('driverSchema', () => {
  const valid = { firstName: 'Marko', lastName: 'Petrović' }

  it('accepts valid data', () => {
    expect(driverSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects empty firstName', () => {
    expect(driverSchema.safeParse({ ...valid, firstName: '' }).success).toBe(false)
  })

  it('rejects empty lastName', () => {
    expect(driverSchema.safeParse({ ...valid, lastName: '' }).success).toBe(false)
  })

  it('accepts valid JMBG', () => {
    expect(driverSchema.safeParse({ ...valid, jmbg: '0101990710008' }).success).toBe(true)
  })

  it('rejects invalid JMBG', () => {
    expect(driverSchema.safeParse({ ...valid, jmbg: '1234567890123' }).success).toBe(false)
  })

  it('accepts empty JMBG (optional)', () => {
    expect(driverSchema.safeParse({ ...valid, jmbg: '' }).success).toBe(true)
    expect(driverSchema.safeParse({ ...valid, jmbg: null }).success).toBe(true)
  })

  it('accepts valid email', () => {
    expect(driverSchema.safeParse({ ...valid, email: 'marko@demo.rs' }).success).toBe(true)
  })

  it('rejects invalid email', () => {
    expect(driverSchema.safeParse({ ...valid, email: 'notanemail' }).success).toBe(false)
  })

  it('accepts empty email (optional)', () => {
    expect(driverSchema.safeParse({ ...valid, email: '' }).success).toBe(true)
  })
})

describe('trailerSchema', () => {
  const valid = { regNumber: 'PR-001-AA', type: 'CURTAIN' }

  it('accepts valid data', () => {
    expect(trailerSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects empty regNumber', () => {
    expect(trailerSchema.safeParse({ ...valid, regNumber: '' }).success).toBe(false)
  })

  it('rejects invalid type', () => {
    expect(trailerSchema.safeParse({ ...valid, type: 'OPEN' }).success).toBe(false)
  })

  it('accepts all valid types', () => {
    for (const t of ['CURTAIN', 'BOX', 'REFRIGERATED', 'FLATBED', 'TANK', 'CONTAINER']) {
      expect(trailerSchema.safeParse({ ...valid, type: t }).success).toBe(true)
    }
  })

  it('rejects negative capacity', () => {
    expect(trailerSchema.safeParse({ ...valid, capacityKg: -500 }).success).toBe(false)
  })
})

describe('documentUploadSchema', () => {
  it('accepts valid data', () => {
    expect(documentUploadSchema.safeParse({ documentType: 'REGISTRATION' }).success).toBe(true)
  })

  it('rejects empty documentType', () => {
    expect(documentUploadSchema.safeParse({ documentType: '' }).success).toBe(false)
  })

  it('accepts optional fields', () => {
    expect(documentUploadSchema.safeParse({ documentType: 'INSURANCE', expirationDate: null, notes: null }).success).toBe(true)
  })
})
