import { describe, it, expect } from 'vitest'
import { COUNTRY_CODES, PERMIT_STATUS_COLORS } from './constants'

describe('Permits constants', () => {
  describe('COUNTRY_CODES', () => {
    it('has expected countries', () => {
      const codes = COUNTRY_CODES.map((c) => c.code)
      expect(codes).toContain('AT')
      expect(codes).toContain('DE')
      expect(codes).toContain('IT')
      expect(codes).toContain('FR')
      expect(codes).toContain('HU')
      expect(codes).toContain('RO')
      expect(codes).toContain('HR')
      expect(codes).toContain('SI')
      expect(codes).toContain('BA')
    })

    it('each entry has code and name', () => {
      for (const entry of COUNTRY_CODES) {
        expect(entry.code).toBeTruthy()
        expect(entry.code).toHaveLength(2)
        expect(entry.name).toBeTruthy()
      }
    })

    it('has no duplicate codes', () => {
      const codes = COUNTRY_CODES.map((c) => c.code)
      expect(new Set(codes).size).toBe(codes.length)
    })
  })

  describe('PERMIT_STATUS_COLORS', () => {
    it('has all 5 statuses', () => {
      const statuses = Object.keys(PERMIT_STATUS_COLORS)
      expect(statuses).toContain('AVAILABLE')
      expect(statuses).toContain('ASSIGNED')
      expect(statuses).toContain('IN_USE')
      expect(statuses).toContain('EXPIRED')
      expect(statuses).toContain('USED')
      expect(statuses).toHaveLength(5)
    })

    it('each status has variant and label', () => {
      for (const [, value] of Object.entries(PERMIT_STATUS_COLORS)) {
        expect(value).toHaveProperty('variant')
        expect(value).toHaveProperty('label')
        expect(value.variant).toBeTruthy()
        expect(value.label).toBeTruthy()
      }
    })

    it('EXPIRED uses destructive variant', () => {
      expect(PERMIT_STATUS_COLORS.EXPIRED.variant).toBe('destructive')
    })
  })
})
