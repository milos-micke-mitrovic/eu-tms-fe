import { describe, it, expect } from 'vitest'
import { formatDate, formatDateTime, formatRelative } from './format-date'

describe('formatDate', () => {
  it('formats ISO date string to dd.MM.yyyy', () => {
    expect(formatDate('2026-04-09')).toBe('09.04.2026')
  })

  it('formats Date object', () => {
    expect(formatDate(new Date(2026, 3, 9))).toBe('09.04.2026')
  })

  it('returns — for invalid date', () => {
    expect(formatDate('invalid')).toBe('—')
  })

  it('uses custom format', () => {
    expect(formatDate('2026-04-09', 'yyyy')).toBe('2026')
  })
})

describe('formatDateTime', () => {
  it('formats with time', () => {
    const result = formatDateTime('2026-04-09T14:30:00')
    expect(result).toContain('09.04.2026')
    expect(result).toContain('14:30')
  })
})

describe('formatRelative', () => {
  it('returns — for invalid date', () => {
    expect(formatRelative('invalid')).toBe('—')
  })

  it('returns a relative string for valid date', () => {
    const result = formatRelative(new Date().toISOString())
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })
})
