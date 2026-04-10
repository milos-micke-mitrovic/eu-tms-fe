import { describe, it, expect } from 'vitest'
import { invoiceSchema } from './schemas'

describe('invoiceSchema', () => {
  const validItem = {
    description: 'Transport BG-DE',
    quantity: 1,
    unit: 'kom',
    unitPrice: 1200,
  }
  const valid = {
    partnerId: 1,
    invoiceDate: '2026-04-10',
    dueDate: '2026-05-10',
    currency: 'EUR',
    vatRate: 20,
    items: [validItem],
  }

  it('accepts valid data', () => {
    expect(invoiceSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects zero partnerId', () => {
    expect(invoiceSchema.safeParse({ ...valid, partnerId: 0 }).success).toBe(
      false
    )
  })

  it('rejects empty invoiceDate', () => {
    expect(invoiceSchema.safeParse({ ...valid, invoiceDate: '' }).success).toBe(
      false
    )
  })

  it('rejects empty dueDate', () => {
    expect(invoiceSchema.safeParse({ ...valid, dueDate: '' }).success).toBe(
      false
    )
  })

  it('rejects empty items', () => {
    expect(invoiceSchema.safeParse({ ...valid, items: [] }).success).toBe(false)
  })

  it('rejects item with empty description', () => {
    expect(
      invoiceSchema.safeParse({
        ...valid,
        items: [{ ...validItem, description: '' }],
      }).success
    ).toBe(false)
  })

  it('rejects item with zero quantity', () => {
    expect(
      invoiceSchema.safeParse({
        ...valid,
        items: [{ ...validItem, quantity: 0 }],
      }).success
    ).toBe(false)
  })

  it('rejects negative unitPrice', () => {
    expect(
      invoiceSchema.safeParse({
        ...valid,
        items: [{ ...validItem, unitPrice: -100 }],
      }).success
    ).toBe(false)
  })

  it('defaults currency to RSD', () => {
    const result = invoiceSchema.safeParse({
      partnerId: 1,
      invoiceDate: '2026-04-10',
      dueDate: '2026-05-10',
      vatRate: 20,
      items: [validItem],
    })
    expect(result.success && result.data.currency).toBe('RSD')
  })

  it('accepts multiple items', () => {
    const result = invoiceSchema.safeParse({
      ...valid,
      items: [validItem, { ...validItem, description: 'Parking' }],
    })
    expect(result.success).toBe(true)
  })

  it('accepts optional notes', () => {
    expect(
      invoiceSchema.safeParse({ ...valid, notes: 'Napomena' }).success
    ).toBe(true)
    expect(
      invoiceSchema.safeParse({ ...valid, notes: undefined }).success
    ).toBe(true)
  })
})
