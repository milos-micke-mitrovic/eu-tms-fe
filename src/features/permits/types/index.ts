export type Permit = {
  id: number
  permitType: 'CEMT' | 'BILATERAL' | 'ECMT'
  countryCode: string | null
  countryName: string | null
  permitNumber: string
  validFrom: string
  validTo: string
  assignedVehicleId: number | null
  assignedRouteId: number | null
  status: 'AVAILABLE' | 'ASSIGNED' | 'IN_USE' | 'EXPIRED' | 'USED'
  notes: string | null
  createdAt: string
}

export type PermitRequest = {
  permitType: 'CEMT' | 'BILATERAL' | 'ECMT'
  countryCode?: string
  countryName?: string
  permitNumber: string
  validFrom: string
  validTo: string
  notes?: string
}

export type PermitAssignRequest = {
  vehicleId: number
  routeId?: number
}
