import { describe, it, expect } from 'vitest'
import { partnerSchema } from './schemas'

describe('partnerSchema', () => {
  const valid = { name: 'Delta Transport d.o.o.', partnerType: 'CLIENT' }

  it('accepts valid data', () => {
    expect(partnerSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects empty name', () => {
    expect(partnerSchema.safeParse({ ...valid, name: '' }).success).toBe(false)
  })

  it('rejects invalid partnerType', () => {
    expect(partnerSchema.safeParse({ ...valid, partnerType: 'VENDOR' }).success).toBe(false)
  })

  it('accepts all valid partnerTypes', () => {
    for (const t of ['CLIENT', 'SUPPLIER', 'BOTH']) {
      expect(partnerSchema.safeParse({ ...valid, partnerType: t }).success).toBe(true)
    }
  })

  it('accepts valid PIB', () => {
    expect(partnerSchema.safeParse({ ...valid, pib: '100000008' }).success).toBe(true)
  })

  it('rejects invalid PIB (checksum)', () => {
    expect(partnerSchema.safeParse({ ...valid, pib: '123456789' }).success).toBe(false)
  })

  it('accepts empty PIB (optional)', () => {
    expect(partnerSchema.safeParse({ ...valid, pib: '' }).success).toBe(true)
    expect(partnerSchema.safeParse({ ...valid, pib: null }).success).toBe(true)
  })

  it('rejects invalid email', () => {
    expect(partnerSchema.safeParse({ ...valid, email: 'bad' }).success).toBe(false)
  })

  it('accepts empty email', () => {
    expect(partnerSchema.safeParse({ ...valid, email: '' }).success).toBe(true)
  })

  it('accepts full data', () => {
    const full = {
      ...valid, pib: '100000008', maticniBroj: '12345678', address: 'Nemanjina 4',
      city: 'Beograd', country: 'RS', zipCode: '11000', bankAccount: '160-12345-67',
      phone: '+381111234567', email: 'info@delta.rs', contactPerson: 'Petar', notes: 'VIP',
    }
    expect(partnerSchema.safeParse(full).success).toBe(true)
  })
})
