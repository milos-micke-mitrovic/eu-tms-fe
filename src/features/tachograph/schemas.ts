import { z } from 'zod'

export const tachographEntrySchema = z
  .object({
    driverId: z.coerce.number().positive(),
    entryDate: z.string().min(1),
    drivingMinutes: z.coerce.number().min(0).max(1440),
    restMinutes: z.coerce.number().min(0).max(1440),
    otherWorkMinutes: z.coerce.number().min(0).max(1440),
    availabilityMinutes: z.coerce.number().min(0).max(1440),
    startOdometerKm: z.coerce.number().min(0).optional().nullable(),
    endOdometerKm: z.coerce.number().min(0).optional().nullable(),
    notes: z.string().max(500).optional().nullable(),
  })
  .refine(
    (data) =>
      data.drivingMinutes +
        data.restMinutes +
        data.otherWorkMinutes +
        data.availabilityMinutes ===
      1440,
    {
      message: 'Ukupno vreme mora biti 24 sata (1440 minuta)',
      path: ['drivingMinutes'],
    }
  )

export type TachographEntryFormData = z.infer<typeof tachographEntrySchema>
