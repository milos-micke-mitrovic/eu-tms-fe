export type FuelTank = {
  id: number
  name: string
  capacityLiters: number
  currentLevelLiters: number
  fuelType: string
  percentFull: number | null
  location: string | null
  createdAt: string
}

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
  tankId: number
  transactionType: 'REFILL' | 'DISPENSE'
  liters: number
  pricePerLiter?: number | null
  vehicleId?: number | null
  driverId?: number | null
  odometerKm?: number | null
  transactionDate?: string
  notes?: string | null
}
