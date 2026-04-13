// ── CMR Document ─────────────────────────────────────────

export type CmrDocument = {
  id: number
  routeId: number
  cmrNumber: string
  language: string
  generatedAt: string
  pdfUrl: string | null
}

// ── Travel Order ─────────────────────────────────────────

export type TravelOrderStatus = 'DRAFT' | 'APPROVED' | 'COMPLETED' | 'CANCELLED'

export type TravelOrder = {
  id: number
  routeId: number
  orderNumber: string
  driverId: number
  driverName: string
  vehicleId: number
  vehicleRegNumber: string
  departureDatetime: string | null
  returnDatetime: string | null
  destination: string | null
  purpose: string
  status: TravelOrderStatus
  fuelAdvance: number
  perDiemAdvance: number
  tollAdvance: number
  otherAdvance: number
  actualFuelCost: number | null
  actualPerDiem: number | null
  actualTollCost: number | null
  actualOtherCost: number | null
  notes: string | null
  createdAt: string
}

export type TravelOrderRequest = {
  routeId: number
  driverId: number
  vehicleId: number
  departureDatetime?: string | null
  returnDatetime?: string | null
  destination?: string
  purpose?: string
  notes?: string
  fuelAdvance?: number
  perDiemAdvance?: number
  tollAdvance?: number
  otherAdvance?: number
}
