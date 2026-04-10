// ── Re-export generated schema types ────────────────────────
// These represent the full GraphQL schema shape (all fields).
// For query-specific subsets, use the query result types from @/generated/graphql.
export type {
  Vehicle,
  VehicleDocument,
  VehiclePage,
  Driver,
  DriverDocument,
  DriverPage,
  Trailer,
  TrailerPage,
} from '@/generated/graphql'

// ── Query result element types ──────────────────────────────
// These match the EXACT shape returned by each query (subset of fields).
import type {
  GetVehiclesQuery,
  GetVehicleQuery,
  GetDriversQuery,
  GetDriverQuery,
  GetTrailersQuery,
} from '@/generated/graphql'

/** A vehicle row as returned by the list query */
export type VehicleListItem = GetVehiclesQuery['vehicles']['content'][number]
/** A vehicle as returned by the detail query */
export type VehicleDetail = NonNullable<GetVehicleQuery['vehicle']>

/** A driver row as returned by the list query */
export type DriverListItem = GetDriversQuery['drivers']['content'][number]
/** A driver as returned by the detail query */
export type DriverDetail = NonNullable<GetDriverQuery['driver']>

/** A trailer row as returned by the list query */
export type TrailerListItem = GetTrailersQuery['trailers']['content'][number]

// ── Union literal types (more specific than generated `string`) ──
export type VehicleStatus = 'ACTIVE' | 'IN_SERVICE' | 'INACTIVE'
export type VehicleType = 'TRUCK' | 'TRACTOR' | 'TRAILER' | 'SEMI_TRAILER'
export type FuelType = 'DIESEL' | 'PETROL' | 'LPG' | 'CNG' | 'ELECTRIC'
export type Ownership = 'OWNED' | 'LEASED' | 'RENTED'
export type DriverStatus = 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE'
export type TrailerType =
  | 'CURTAIN'
  | 'BOX'
  | 'REFRIGERATED'
  | 'FLATBED'
  | 'TANK'
  | 'CONTAINER'
export type TrailerStatus = 'ACTIVE' | 'IN_SERVICE' | 'INACTIVE'

// ── Request types (REST-only, not in GraphQL schema) ─────────
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

export type TrailerRequest = {
  regNumber: string
  type: TrailerType
  lengthM?: number | null
  capacityKg?: number | null
  year?: number | null
  ownership?: Ownership | null
}

// ── Filter types (used for query variables) ──────────────────
export type VehicleFilter = {
  status?: string
  vehicleType?: string
  search?: string
  sortBy?: string
  sortDir?: string
  page?: number
  size?: number
}

export type DriverFilter = {
  status?: string
  companyId?: number
  search?: string
  sortBy?: string
  sortDir?: string
  page?: number
  size?: number
}

// ── Document types ──────────────────────────────────────────
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

export type DocumentUploadRequest = {
  documentType: string
  expirationDate?: string | null
  notes?: string | null
}
