import { describe, it, expect } from 'vitest'
import {
  PAYMENT_METHOD_CONFIG,
  AGING_BUCKET_COLORS,
  REMINDER_TYPE_CONFIG,
  SEND_VIA_OPTIONS,
} from './index'

describe('PAYMENT_METHOD_CONFIG', () => {
  it('has all expected payment methods', () => {
    const expected = [
      'BANK_TRANSFER',
      'CASH',
      'COMPENSATION',
      'FACTORING',
      'OTHER',
    ]
    expect(Object.keys(PAYMENT_METHOD_CONFIG)).toEqual(expected)
  })

  it('each method has label and key', () => {
    for (const method of Object.values(PAYMENT_METHOD_CONFIG)) {
      expect(method).toHaveProperty('label')
      expect(method).toHaveProperty('key')
      expect(typeof method.label).toBe('string')
      expect(typeof method.key).toBe('string')
    }
  })
})

describe('AGING_BUCKET_COLORS', () => {
  it('has all expected buckets', () => {
    const expected = ['0-30', '31-60', '61-90', '90+']
    expect(Object.keys(AGING_BUCKET_COLORS)).toEqual(expected)
  })

  it('each bucket has a hex color value', () => {
    for (const color of Object.values(AGING_BUCKET_COLORS)) {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })
})

describe('REMINDER_TYPE_CONFIG', () => {
  it('has all expected reminder types', () => {
    const expected = ['FIRST', 'SECOND', 'THIRD', 'FINAL', 'CUSTOM']
    expect(Object.keys(REMINDER_TYPE_CONFIG)).toEqual(expected)
  })

  it('each type has label, key, and color', () => {
    for (const type of Object.values(REMINDER_TYPE_CONFIG)) {
      expect(type).toHaveProperty('label')
      expect(type).toHaveProperty('key')
      expect(type).toHaveProperty('color')
    }
  })
})

describe('SEND_VIA_OPTIONS', () => {
  it('has all expected options', () => {
    expect([...SEND_VIA_OPTIONS]).toEqual(['EMAIL', 'SMS', 'POSTAL'])
  })
})
