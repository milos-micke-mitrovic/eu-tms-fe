// ── Re-export generated GraphQL types ─────
export type {
  Payroll,
  PayrollSummary,
  DriverAdvance,
} from '@/generated/graphql'

// ── REST-only types ───────────────────────
export type DriverSalaryConfig = {
  id: number
  driverId: number
  driverName: string
  baseSalaryRsd: number
  hourlyRateRsd: number | null
  overtimeRateMultiplier: number | null
  perKmRateRsd: number | null
  bonusPerRouteRsd: number | null
  validFrom: string
  validTo: string | null
  notes: string | null
  createdAt: string
}

export type DriverSalaryConfigRequest = {
  driverId: number
  baseSalaryRsd: number
  hourlyRateRsd?: number
  overtimeRateMultiplier?: number
  perKmRateRsd?: number
  bonusPerRouteRsd?: number
  validFrom: string
  validTo?: string
  notes?: string
}

export type PayrollAdjustmentRequest = {
  otherBonusRsd?: number
  otherBonusDescription?: string
  otherDeductionRsd?: number
  otherDeductionDescription?: string
  taxRsd?: number
  socialContributionsRsd?: number
  notes?: string
}

export type DriverAdvanceRequest = {
  driverId: number
  amountRsd: number
  advanceDate: string
  advanceType: string
  description?: string
}
