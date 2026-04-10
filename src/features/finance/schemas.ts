import { z } from 'zod'

export const invoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  unitPrice: z.number().positive(),
})

export const invoiceSchema = z.object({
  partnerId: z.number().positive(),
  invoiceDate: z.string().min(1),
  dueDate: z.string().min(1),
  currency: z.string().default('RSD'),
  vatRate: z.number().min(0).default(20),
  items: z.array(invoiceItemSchema).min(1),
  relatedRouteIds: z.string().optional(),
  notes: z.string().optional(),
})

export type InvoiceFormData = z.infer<typeof invoiceSchema>
