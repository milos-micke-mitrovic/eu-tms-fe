import { z } from 'zod'

export const tankSchema = z.object({
  name: z.string().min(1),
  capacityLiters: z.coerce.number().positive(),
  fuelType: z.string().min(1),
  location: z.string().optional().nullable(),
})

export const transactionSchema = z.object({
  liters: z.coerce.number().positive(),
  pricePerLiter: z.coerce.number().positive().optional().nullable(),
  vehicleId: z.coerce.number().positive().optional().nullable(),
  driverId: z.coerce.number().positive().optional().nullable(),
  odometerKm: z.coerce.number().min(0).optional().nullable(),
  transactionDate: z.string().min(1),
  notes: z.string().optional().nullable(),
})

export type TankFormData = z.infer<typeof tankSchema>
export type TransactionFormData = z.infer<typeof transactionSchema>
