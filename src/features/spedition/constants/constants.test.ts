import { describe, it, expect } from 'vitest'
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_COLORS, CURRENCIES, COUNTRY_CODES, VALID_NEXT_STATUSES, STOP_TYPE_COLORS } from './index'

describe('EXPENSE_CATEGORIES', () => {
  it('has 14 categories', () => {
    expect(EXPENSE_CATEGORIES).toHaveLength(14)
  })

  it('each has value, labelKey, icon', () => {
    for (const cat of EXPENSE_CATEGORIES) {
      expect(cat.value).toBeTruthy()
      expect(cat.labelKey).toContain('spedition:expenses.categories.')
      expect(cat.icon).toBeDefined()
    }
  })

  it('each category has a color', () => {
    for (const cat of EXPENSE_CATEGORIES) {
      expect(EXPENSE_CATEGORY_COLORS[cat.value]).toBeTruthy()
    }
  })
})

describe('CURRENCIES', () => {
  it('includes RSD, EUR, TRY', () => {
    expect(CURRENCIES).toContain('RSD')
    expect(CURRENCIES).toContain('EUR')
    expect(CURRENCIES).toContain('TRY')
  })
})

describe('COUNTRY_CODES', () => {
  it('includes Serbia', () => {
    expect(COUNTRY_CODES.find((c) => c.code === 'RS')).toBeTruthy()
  })

  it('includes Turkey', () => {
    expect(COUNTRY_CODES.find((c) => c.code === 'TR')).toBeTruthy()
  })

  it('has at least 30 countries', () => {
    expect(COUNTRY_CODES.length).toBeGreaterThanOrEqual(30)
  })

  it('each has code and name', () => {
    for (const c of COUNTRY_CODES) {
      expect(c.code).toHaveLength(2)
      expect(c.name).toBeTruthy()
    }
  })
})

describe('VALID_NEXT_STATUSES', () => {
  it('CREATED can go to DISPATCHED or CANCELLED', () => {
    expect(VALID_NEXT_STATUSES.CREATED).toContain('DISPATCHED')
    expect(VALID_NEXT_STATUSES.CREATED).toContain('CANCELLED')
  })

  it('PAID has no next statuses', () => {
    expect(VALID_NEXT_STATUSES.PAID).toHaveLength(0)
  })

  it('CANCELLED has no next statuses', () => {
    expect(VALID_NEXT_STATUSES.CANCELLED).toHaveLength(0)
  })

  it('full state machine is valid', () => {
    // CREATED → DISPATCHED → IN_TRANSIT → COMPLETED → INVOICED → PAID
    expect(VALID_NEXT_STATUSES.CREATED).toContain('DISPATCHED')
    expect(VALID_NEXT_STATUSES.DISPATCHED).toContain('IN_TRANSIT')
    expect(VALID_NEXT_STATUSES.IN_TRANSIT).toContain('COMPLETED')
    expect(VALID_NEXT_STATUSES.COMPLETED).toContain('INVOICED')
    expect(VALID_NEXT_STATUSES.INVOICED).toContain('PAID')
  })
})

describe('STOP_TYPE_COLORS', () => {
  it('has colors for all stop types', () => {
    const types = ['LOADING', 'UNLOADING', 'BORDER', 'CUSTOMS', 'REST', 'FUEL', 'OTHER'] as const
    for (const t of types) {
      expect(STOP_TYPE_COLORS[t]).toBeTruthy()
    }
  })
})
