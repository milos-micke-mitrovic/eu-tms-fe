import { z } from 'zod'

export const tenantSchema = z.object({
  subdomain: z
    .string()
    .min(1)
    .regex(/^[a-zA-Z0-9-]+$/, {
      message: 'Samo slova, brojevi i crtica',
    }),
  name: z.string().min(1),
  active: z.boolean().default(true),
})

export type TenantFormData = z.infer<typeof tenantSchema>

export const companySchema = z.object({
  name: z.string().min(1),
  pib: z
    .string()
    .regex(/^\d{9}$/, { message: 'PIB mora imati tačno 9 cifara' })
    .optional()
    .or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
})

export type CompanyFormData = z.infer<typeof companySchema>

export const adminSchema = z.object({
  companyId: z.number().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
})

export type AdminFormData = z.infer<typeof adminSchema>
