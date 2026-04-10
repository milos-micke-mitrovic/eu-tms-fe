import { describe, it, expect } from 'vitest'
import { isValidPib, isValidJmbg, isValidEmail } from './validation'

describe('isValidPib', () => {
  it('validates correct PIB (mod11)', () => {
    expect(isValidPib('100000008')).toBe(true)
    expect(isValidPib('100000016')).toBe(true)
    expect(isValidPib('100000024')).toBe(true)
  })

  it('rejects invalid PIB (checksum fail)', () => {
    expect(isValidPib('100000001')).toBe(false)
    expect(isValidPib('123456789')).toBe(false)
    expect(isValidPib('111111111')).toBe(false)
  })

  it('rejects wrong length', () => {
    expect(isValidPib('12345678')).toBe(false)
    expect(isValidPib('1234567890')).toBe(false)
    expect(isValidPib('')).toBe(false)
  })

  it('rejects non-numeric', () => {
    expect(isValidPib('12345678a')).toBe(false)
    expect(isValidPib('abcdefghi')).toBe(false)
  })

  // NOTE: BE seed data uses dummy PIBs that don't pass mod11 — BE seed bug
  it('correctly rejects dummy seed PIBs', () => {
    expect(isValidPib('106580860')).toBe(false)
    expect(isValidPib('100000370')).toBe(false)
  })
})

describe('isValidJmbg', () => {
  it('validates correct JMBG (mod11)', () => {
    expect(isValidJmbg('0101990710008')).toBe(true)
    expect(isValidJmbg('0101990710016')).toBe(true)
    expect(isValidJmbg('0101990710024')).toBe(true)
  })

  it('rejects invalid JMBG (checksum fail)', () => {
    expect(isValidJmbg('1234567890123')).toBe(false)
    expect(isValidJmbg('0101990710001')).toBe(false)
  })

  it('rejects wrong length', () => {
    expect(isValidJmbg('123456789012')).toBe(false)
    expect(isValidJmbg('12345678901234')).toBe(false)
    expect(isValidJmbg('')).toBe(false)
  })

  it('rejects non-numeric', () => {
    expect(isValidJmbg('010199071012a')).toBe(false)
  })

  // NOTE: BE seed data uses dummy JMBGs that don't pass mod11 — BE seed bug
  it('correctly rejects dummy seed JMBGs', () => {
    expect(isValidJmbg('0101990710123')).toBe(false)
    expect(isValidJmbg('0202985710234')).toBe(false)
  })
})

describe('isValidEmail', () => {
  it('validates correct emails', () => {
    expect(isValidEmail('marko@demo.rs')).toBe(true)
    expect(isValidEmail('user@example.com')).toBe(true)
  })

  it('rejects invalid emails', () => {
    expect(isValidEmail('notanemail')).toBe(false)
    expect(isValidEmail('@nodomain')).toBe(false)
    expect(isValidEmail('')).toBe(false)
  })
})
