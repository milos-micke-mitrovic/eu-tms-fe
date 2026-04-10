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
  driverName: string
  vehicleRegNumber: string
  departureDate: string
  returnDate: string | null
  status: TravelOrderStatus
  perDiemTotalRsd: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type TravelOrderRequest = {
  routeId: number
  driverId: number
  vehicleId: number
  departureDate: string
  returnDate?: string | null
  purpose?: string
  notes?: string
}
