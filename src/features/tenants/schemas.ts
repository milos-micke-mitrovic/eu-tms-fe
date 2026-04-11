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
