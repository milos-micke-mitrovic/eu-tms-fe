// PARTIAL: BE Sprint 3 — types defined per CLAUDE.md, BE not yet implemented

export type FuelTank = {
  id: number
  name: string
  fuelType: string
  capacityLiters: number
  currentLevelLiters: number
  createdAt: string
}

export type FuelTankRequest = {
  name: string
  fuelType: string
  capacityLiters: number
  currentLevelLiters: number
}

export type FuelTransaction = {
  id: number
  tankId: number
  tankName: string
  type: 'REFILL' | 'DISPENSE'
  liters: number
  pricePerLiter: number | null
  vehicleId: number | null
  vehicleRegNumber: string | null
  odometerKm: number | null
  notes: string | null
  createdAt: string
}

export type FuelTransactionRequest = {
  tankId: number
  type: 'REFILL' | 'DISPENSE'
  liters: number
  pricePerLiter?: number | null
  vehicleId?: number | null
  odometerKm?: number | null
  notes?: string | null
}
