import { describe, it, expect } from 'vitest'
import { tenantSchema, companySchema, adminSchema } from './schemas'

describe('tenantSchema', () => {
  const valid = {
    subdomain: 'acme-transport',
    name: 'Acme d.o.o.',
    active: true,
  }

  it('accepts valid data', () => {
    expect(tenantSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects empty subdomain', () => {
    expect(tenantSchema.safeParse({ ...valid, subdomain: '' }).success).toBe(
      false
    )
  })

  it('rejects empty name', () => {
    expect(tenantSchema.safeParse({ ...valid, name: '' }).success).toBe(false)
  })

  it('rejects subdomain with spaces', () => {
    expect(
      tenantSchema.safeParse({ ...valid, subdomain: 'acme transport' }).success
    ).toBe(false)
  })

  it('rejects subdomain with special chars', () => {
    expect(
      tenantSchema.safeParse({ ...valid, subdomain: 'acme@transport' }).success
    ).toBe(false)
  })

  it('accepts subdomain with hyphens and numbers', () => {
    expect(
      tenantSchema.safeParse({ ...valid, subdomain: 'acme-123' }).success
    ).toBe(true)
  })

  it('defaults active to true', () => {
    const result = tenantSchema.safeParse({ subdomain: 'test', name: 'Test' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.active).toBe(true)
    }
  })
})

describe('companySchema', () => {
  it('accepts valid company with name only', () => {
    expect(companySchema.safeParse({ name: 'Test d.o.o.' }).success).toBe(true)
  })

  it('rejects empty name', () => {
    expect(companySchema.safeParse({ name: '' }).success).toBe(false)
  })

  it('accepts valid 9-digit PIB', () => {
    expect(
      companySchema.safeParse({ name: 'Test', pib: '123456789' }).success
    ).toBe(true)
  })

  it('rejects invalid PIB length', () => {
    expect(
      companySchema.safeParse({ name: 'Test', pib: '12345' }).success
    ).toBe(false)
  })
})

describe('adminSchema', () => {
  const valid = {
    companyId: 1,
    firstName: 'Marko',
    lastName: 'Petrovic',
    email: 'marko@test.rs',
    password: 'test1234',
  }

  it('accepts valid admin', () => {
    expect(adminSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects short password', () => {
    expect(adminSchema.safeParse({ ...valid, password: '123' }).success).toBe(
      false
    )
  })

  it('rejects invalid email', () => {
    expect(
      adminSchema.safeParse({ ...valid, email: 'not-email' }).success
    ).toBe(false)
  })
})
