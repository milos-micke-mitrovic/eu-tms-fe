// ── Re-export generated types as single source of truth ─────
export type { FuelTank } from '@/generated/graphql'

// ── REST-only types (not in GraphQL schema) ─────────────────
export type FuelTankRequest = {
  name: string
  capacityLiters: number
  fuelType: string
  location?: string | null
}

export type FuelTransaction = {
  id: number
  fuelTankId: number
  fuelTankName: string
  vehicleId: number | null
  driverId: number | null
  transactionType: 'REFILL' | 'DISPENSE'
  liters: number
  pricePerLiter: number | null
  totalCost: number | null
  odometerKm: number | null
  transactionDate: string
  notes: string | null
  createdAt: string
}

export type FuelTransactionRequest = {
  fuelTankId: number
  transactionType: 'REFILL' | 'DISPENSE'
  liters: number
  pricePerLiter?: number | null
  vehicleId?: number | null
  driverId?: number | null
  odometerKm?: number | null
  transactionDate?: string
  notes?: string | null
}
