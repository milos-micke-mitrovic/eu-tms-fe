import { z } from 'zod'
// isValidJmbg removed — autofill between JMBG and birthDate replaces validation

export const vehicleSchema = z.object({
  regNumber: z.string().min(1),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce.number().min(1900).max(2100).optional().nullable(),
  vin: z.string().optional().nullable(),
  vehicleType: z.enum(['TRUCK', 'TRACTOR', 'TRAILER', 'SEMI_TRAILER']),
  fuelType: z.enum(['DIESEL', 'PETROL', 'LPG', 'CNG', 'ELECTRIC']),
  ownership: z.enum(['OWNED', 'LEASED', 'RENTED']).optional().nullable(),
  cargoCapacityKg: z.coerce.number().positive().optional().nullable(),
  cargoVolumeM3: z.coerce.number().positive().optional().nullable(),
  avgConsumptionL100km: z.coerce.number().positive().optional().nullable(),
  odometerKm: z.coerce.number().min(0).optional().nullable(),
  currentDriverId: z.coerce.number().positive().optional().nullable(),
})

export const driverSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  jmbg: z
    .string()
    .regex(/^(\d{13})?$/, { message: 'JMBG mora imati 13 cifara' })
    .optional()
    .or(z.literal(''))
    .nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal('')).nullable(),
  birthDate: z.string().optional().nullable(),
  licenseNumber: z.string().optional().nullable(),
  licenseCategories: z.string().optional().nullable(),
  adrCertificate: z.boolean().optional().nullable(),
  adrExpiry: z.string().optional().nullable(),
  healthCheckExpiry: z.string().optional().nullable(),
  employmentDate: z.string().optional().nullable(),
  vehicleId: z.coerce.number().positive().optional().nullable(),
})

export const trailerSchema = z.object({
  regNumber: z.string().min(1),
  type: z.enum([
    'CURTAIN',
    'BOX',
    'REFRIGERATED',
    'FLATBED',
    'TANK',
    'CONTAINER',
  ]),
  lengthM: z.coerce.number().positive().optional().nullable(),
  capacityKg: z.coerce.number().positive().optional().nullable(),
  year: z.coerce.number().min(1900).max(2100).optional().nullable(),
  ownership: z.enum(['OWNED', 'LEASED', 'RENTED']).optional().nullable(),
})

export const documentUploadSchema = z.object({
  documentType: z.string().min(1),
  expirationDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export type VehicleFormData = z.infer<typeof vehicleSchema>
export type DriverFormData = z.infer<typeof driverSchema>
export type TrailerFormData = z.infer<typeof trailerSchema>
export type DocumentUploadFormData = z.infer<typeof documentUploadSchema>
