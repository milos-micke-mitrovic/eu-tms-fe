import { describe, it, expect } from 'vitest'
import { tenantSchema } from './schemas'

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
    expect(
      tenantSchema.safeParse({ ...valid, subdomain: 'acme.transport' }).success
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
