import { z } from 'zod'

export const salaryConfigSchema = z.object({
  driverId: z.coerce.number().positive(),
  baseSalaryRsd: z.coerce.number().min(0),
  hourlyRateRsd: z.coerce.number().min(0).optional().nullable(),
  overtimeRateMultiplier: z.coerce.number().min(1).max(5).optional().nullable(),
  perKmRateRsd: z.coerce.number().min(0).optional().nullable(),
  bonusPerRouteRsd: z.coerce.number().min(0).optional().nullable(),
  validFrom: z.string().min(1),
  validTo: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
})

export type SalaryConfigFormData = z.infer<typeof salaryConfigSchema>

export const advanceSchema = z.object({
  driverId: z.coerce.number().positive(),
  amountRsd: z.coerce.number().positive(),
  advanceDate: z.string().min(1),
  advanceType: z.enum([
    'ADVANCE',
    'DEDUCTION',
    'BONUS',
    'FINE',
    'LOAN_REPAYMENT',
  ]),
  description: z.string().max(500).optional().nullable(),
})

export type AdvanceFormData = z.infer<typeof advanceSchema>

export const payrollAdjustmentSchema = z.object({
  otherBonusRsd: z.coerce.number().min(0).optional().nullable(),
  otherBonusDescription: z.string().max(500).optional().nullable(),
  otherDeductionRsd: z.coerce.number().min(0).optional().nullable(),
  otherDeductionDescription: z.string().max(500).optional().nullable(),
  taxRsd: z.coerce.number().min(0).optional().nullable(),
  socialContributionsRsd: z.coerce.number().min(0).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
})

export type PayrollAdjustmentFormData = z.infer<typeof payrollAdjustmentSchema>
