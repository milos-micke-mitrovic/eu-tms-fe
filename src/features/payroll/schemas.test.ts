import { describe, it, expect } from 'vitest'
import {
  salaryConfigSchema,
  advanceSchema,
  payrollAdjustmentSchema,
} from './schemas'

describe('salaryConfigSchema', () => {
  const valid = {
    driverId: 1,
    baseSalaryRsd: 80000,
    validFrom: '2026-01-01',
  }

  it('accepts valid data', () => {
    expect(salaryConfigSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects negative baseSalaryRsd', () => {
    expect(
      salaryConfigSchema.safeParse({ ...valid, baseSalaryRsd: -1 }).success
    ).toBe(false)
  })

  it('accepts optional fields as null', () => {
    expect(
      salaryConfigSchema.safeParse({
        ...valid,
        hourlyRateRsd: null,
        overtimeRateMultiplier: null,
        perKmRateRsd: null,
        bonusPerRouteRsd: null,
        validTo: null,
        notes: null,
      }).success
    ).toBe(true)
  })

  it('rejects overtime multiplier > 5', () => {
    expect(
      salaryConfigSchema.safeParse({
        ...valid,
        overtimeRateMultiplier: 6,
      }).success
    ).toBe(false)
  })
})

describe('advanceSchema', () => {
  const valid = {
    driverId: 1,
    amountRsd: 5000,
    advanceDate: '2026-04-01',
    advanceType: 'ADVANCE' as const,
  }

  it('accepts valid data', () => {
    expect(advanceSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects invalid advanceType', () => {
    expect(
      advanceSchema.safeParse({ ...valid, advanceType: 'INVALID' }).success
    ).toBe(false)
  })

  it('rejects zero amountRsd', () => {
    expect(advanceSchema.safeParse({ ...valid, amountRsd: 0 }).success).toBe(
      false
    )
  })

  it('accepts all valid advance types', () => {
    for (const type of [
      'ADVANCE',
      'DEDUCTION',
      'BONUS',
      'FINE',
      'LOAN_REPAYMENT',
    ]) {
      expect(
        advanceSchema.safeParse({ ...valid, advanceType: type }).success
      ).toBe(true)
    }
  })
})

describe('payrollAdjustmentSchema', () => {
  const valid = {
    otherBonusRsd: 1000,
    otherBonusDescription: 'Holiday bonus',
  }

  it('accepts valid data', () => {
    expect(payrollAdjustmentSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts empty object (all fields optional)', () => {
    expect(payrollAdjustmentSchema.safeParse({}).success).toBe(true)
  })

  it('rejects negative otherBonusRsd', () => {
    expect(
      payrollAdjustmentSchema.safeParse({ otherBonusRsd: -100 }).success
    ).toBe(false)
  })

  it('rejects negative otherDeductionRsd', () => {
    expect(
      payrollAdjustmentSchema.safeParse({ otherDeductionRsd: -50 }).success
    ).toBe(false)
  })

  it('rejects notes longer than 1000 characters', () => {
    expect(
      payrollAdjustmentSchema.safeParse({ notes: 'x'.repeat(1001) }).success
    ).toBe(false)
  })
})
