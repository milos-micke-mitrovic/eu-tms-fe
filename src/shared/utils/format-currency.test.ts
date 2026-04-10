import { describe, it, expect } from 'vitest'
import { formatCurrency, formatCurrencyCompact } from './format-currency'

describe('formatCurrency', () => {
  it('formats EUR amounts with sr-RS locale', () => {
    const result = formatCurrency(1234.56, 'EUR')
    expect(result).toContain('1.234,56')
    expect(result).toContain('€')
  })

  it('formats RSD amounts', () => {
    const result = formatCurrency(45320, 'RSD')
    expect(result).toContain('45.320')
    expect(result).toContain('RSD')
  })

  it('formats TRY amounts', () => {
    const result = formatCurrency(1000, 'TRY')
    expect(result).toBeTruthy()
  })

  it('handles string input', () => {
    const result = formatCurrency('1234.56', 'EUR')
    expect(result).toContain('1.234,56')
  })

  it('returns — for NaN', () => {
    expect(formatCurrency('abc', 'EUR')).toBe('—')
    expect(formatCurrency(NaN, 'EUR')).toBe('—')
  })

  it('handles zero', () => {
    const result = formatCurrency(0, 'RSD')
    expect(result).toContain('0')
  })
})

describe('formatCurrencyCompact', () => {
  it('formats millions', () => {
    expect(formatCurrencyCompact(1500000, 'RSD')).toBe('1.5M RSD')
  })

  it('formats thousands', () => {
    expect(formatCurrencyCompact(45000, 'EUR')).toBe('45.0K EUR')
  })

  it('formats small amounts normally', () => {
    const result = formatCurrencyCompact(500, 'EUR')
    expect(result).toContain('500')
  })
})
