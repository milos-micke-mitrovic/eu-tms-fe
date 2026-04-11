import { z } from 'zod'
import { isValidPib } from '@/shared/utils'

export const partnerSchema = z.object({
  name: z.string().min(1),
  pib: z
    .string()
    .refine((v) => !v || isValidPib(v), { message: 'Neispravan PIB' })
    .optional()
    .or(z.literal(''))
    .nullable(),
  maticniBroj: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
  bankAccount: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal('')).nullable(),
  contactPerson: z.string().optional().nullable(),
  partnerType: z.enum(['CLIENT', 'SUPPLIER', 'BOTH']),
  notes: z.string().optional().nullable(),
})

export type PartnerFormData = z.infer<typeof partnerSchema>
