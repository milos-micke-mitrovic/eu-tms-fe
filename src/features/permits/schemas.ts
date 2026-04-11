import { z } from 'zod'

export const permitSchema = z.object({
  permitType: z.enum(['CEMT', 'BILATERAL', 'ECMT']),
  countryCode: z.string().optional().nullable(),
  countryName: z.string().optional().nullable(),
  permitNumber: z.string().min(1),
  validFrom: z.string().min(1),
  validTo: z.string().min(1),
  notes: z.string().optional().nullable(),
})

export const permitAssignSchema = z.object({
  vehicleId: z.coerce.number().positive(),
  routeId: z.coerce.number().positive().optional().nullable(),
})

export type PermitFormData = z.infer<typeof permitSchema>
export type PermitAssignFormData = z.infer<typeof permitAssignSchema>
