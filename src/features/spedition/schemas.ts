import { z } from 'zod'

export const stopSchema = z.object({
  stopOrder: z.coerce.number().min(1),
  stopType: z.enum([
    'LOADING',
    'UNLOADING',
    'BORDER',
    'CUSTOMS',
    'REST',
    'FUEL',
    'OTHER',
  ]),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  countryCode: z.string().min(2),
  zipCode: z.string().optional().nullable(),
  plannedArrival: z.string().optional().nullable(),
  plannedDeparture: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const routeSchema = z.object({
  routeType: z.enum(['DOMESTIC', 'INTERNATIONAL']),
  partnerId: z.coerce.number().positive(),
  vehicleId: z.coerce.number().positive().optional().nullable(),
  driverId: z.coerce.number().positive().optional().nullable(),
  trailerId: z.coerce.number().positive().optional().nullable(),
  departureTime: z.string().optional().nullable(),
  arrivalTime: z.string().optional().nullable(),
  cargoDescription: z.string().min(1),
  cargoWeightKg: z.coerce.number().positive().optional().nullable(),
  cargoVolumeM3: z.coerce.number().positive().optional().nullable(),
  price: z.coerce.number().min(0).optional().nullable(),
  currency: z.string().default('EUR'),
  distanceKm: z.coerce.number().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
  stops: z.array(stopSchema).optional().default([]),
})

export const expenseSchema = z.object({
  category: z.string().min(1),
  amount: z.coerce.number().positive(),
  currency: z.string().default('RSD'),
  exchangeRate: z.coerce.number().positive().optional().nullable(),
  description: z.string().optional().nullable(),
  expenseDate: z.string().min(1),
})

export type StopFormData = z.infer<typeof stopSchema>
export type RouteFormData = z.infer<typeof routeSchema>
export type ExpenseFormData = z.infer<typeof expenseSchema>
