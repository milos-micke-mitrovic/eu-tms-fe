// ── Vehicle ──────────────────────────────────────────────

export type VehicleStatus = 'ACTIVE' | 'IN_SERVICE' | 'INACTIVE'
export type VehicleType = 'TRUCK' | 'TRACTOR' | 'TRAILER' | 'SEMI_TRAILER'
export type FuelType = 'DIESEL' | 'PETROL' | 'LPG' | 'CNG' | 'ELECTRIC'
export type Ownership = 'OWNED' | 'LEASED' | 'RENTED'

export type Vehicle = {
  id: number
  regNumber: string
  make: string
  model: string
  year: number | null
  vin: string | null
  cargoCapacityKg: number | null
  cargoVolumeM3: number | null
  fuelType: FuelType
  vehicleType: VehicleType
  ownership: Ownership
  status: VehicleStatus
  avgConsumptionL100km: number | null
  odometerKm: number | null
  currentDriverId: number | null
  currentDriverName: string | null
  documents: VehicleDocument[]
  createdAt: string
  updatedAt: string
}

export type VehicleRequest = {
  regNumber: string
  make: string
  model: string
  year?: number | null
  vin?: string | null
  cargoCapacityKg?: number | null
  cargoVolumeM3?: number | null
  fuelType: FuelType
  vehicleType: VehicleType
  ownership?: Ownership | null
  avgConsumptionL100km?: number | null
  odometerKm?: number | null
  currentDriverId?: number | null
}

export type VehicleFilter = {
  status?: string
  vehicleType?: string
  search?: string
  page?: number
  size?: number
}

// ── Driver ───────────────────────────────────────────────

export type DriverStatus = 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE'

export type Driver = {
  id: number
  firstName: string
  lastName: string
  jmbg: string | null
  phone: string | null
  email: string | null
  birthDate: string | null
  licenseNumber: string | null
  licenseCategories: string | null
  adrCertificate: boolean | null
  adrExpiry: string | null
  healthCheckExpiry: string | null
  employmentDate: string | null
  status: DriverStatus
  companyId: number | null
  vehicleId: number | null
  vehicleRegNumber: string | null
  documents: DriverDocument[]
  createdAt: string
  updatedAt: string
}

export type DriverRequest = {
  firstName: string
  lastName: string
  jmbg?: string | null
  phone?: string | null
  email?: string | null
  birthDate?: string | null
  licenseNumber?: string | null
  licenseCategories?: string | null
  adrCertificate?: boolean | null
  adrExpiry?: string | null
  healthCheckExpiry?: string | null
  employmentDate?: string | null
  companyId?: number | null
  vehicleId?: number | null
}

export type DriverFilter = {
  status?: string
  companyId?: number
  search?: string
  page?: number
  size?: number
}

// ── Trailer ──────────────────────────────────────────────

export type TrailerType = 'CURTAIN' | 'BOX' | 'REFRIGERATED' | 'FLATBED' | 'TANK' | 'CONTAINER'
export type TrailerStatus = 'ACTIVE' | 'IN_SERVICE' | 'INACTIVE'

export type Trailer = {
  id: number
  regNumber: string
  type: TrailerType
  lengthM: number | null
  capacityKg: number | null
  year: number | null
  ownership: Ownership
  status: TrailerStatus
  createdAt: string
  updatedAt: string
}

export type TrailerRequest = {
  regNumber: string
  type: TrailerType
  lengthM?: number | null
  capacityKg?: number | null
  year?: number | null
  ownership?: Ownership | null
}

// ── Documents ────────────────────────────────────────────

export type VehicleDocumentType =
  | 'REGISTRATION'
  | 'INSURANCE'
  | 'TECHNICAL_INSPECTION'
  | 'ATP_CERTIFICATE'
  | 'ADR_CERTIFICATE'
  | 'OTHER'

export type DriverDocumentType =
  | 'DRIVERS_LICENSE'
  | 'MEDICAL_CERTIFICATE'
  | 'PASSPORT'
  | 'ID_CARD'
  | 'ADR_CERTIFICATE'
  | 'OTHER'

export type VehicleDocument = {
  id: number
  documentType: VehicleDocumentType
  originalFilename: string | null
  expirationDate: string | null
  notes: string | null
  createdAt: string
}

export type DriverDocument = {
  id: number
  documentType: DriverDocumentType
  originalFilename: string | null
  expirationDate: string | null
  notes: string | null
  createdAt: string
}

export type DocumentUploadRequest = {
  documentType: string
  expirationDate?: string | null
  notes?: string | null
}
