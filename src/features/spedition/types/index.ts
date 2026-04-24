// ── Re-export generated types as single source of truth ─────
export type {
  Route,
  RoutePage,
  RouteStop,
  RouteExpense,
  ExpenseSummaryItem,
} from '@/generated/graphql'

// ── Query result element types ──────────────────────────────
import type { GetRoutesQuery, GetRouteQuery } from '@/generated/graphql'

/** A route row as returned by the list query */
export type RouteListItem = GetRoutesQuery['routes']['content'][number]
/** A route as returned by the detail query */
export type RouteDetail = NonNullable<GetRouteQuery['route']>

// ── Union literal types (more specific than generated `string`) ──
export type RouteStatus =
  | 'CREATED'
  | 'DISPATCHED'
  | 'IN_TRANSIT'
  | 'COMPLETED'
  | 'INVOICED'
  | 'PAID'
  | 'CANCELLED'
export type RouteType = 'DOMESTIC' | 'INTERNATIONAL'
export type StopType =
  | 'LOADING'
  | 'UNLOADING'
  | 'BORDER'
  | 'CUSTOMS'
  | 'REST'
  | 'FUEL'
  | 'OTHER'

export type ExpenseCategory =
  | 'FUEL'
  | 'TOLL_DOMESTIC'
  | 'TOLL_INTERNATIONAL'
  | 'PER_DIEM'
  | 'PARKING'
  | 'VIGNETTE'
  | 'CUSTOMS'
  | 'BORDER_FEE'
  | 'FERRY'
  | 'MAINTENANCE'
  | 'WASH'
  | 'PHONE'
  | 'FINE'
  | 'OTHER'

export type ExpenseStatus =
  | 'MANUAL'
  | 'AUTO'
  | 'SUGGESTED'
  | 'CONFIRMED'
  | 'REJECTED'

// ── Request types (REST-only) ───────────────────────────────
export type RouteRequest = {
  routeType: string
  partnerId: number | null
  vehicleId: number | null
  driverId?: number | null
  trailerId?: number | null
  trailerRegNumber?: string | null
  departureTime?: string | null
  arrivalTime?: string | null
  cargoDescription?: string
  cargoType?: string | null
  cargoWeightKg?: number | null
  cargoVolumeM3?: number | null
  price?: number | null
  currency?: string
  distanceKm?: number | null
  notes?: string
  stops?: RouteStopRequest[]
}

export type RouteStopRequest = {
  stopOrder: number
  stopType: string
  address?: string
  city?: string
  countryCode: string
  zipCode?: string
  plannedArrival?: string | null
  plannedDeparture?: string | null
  notes?: string
  companyName?: string | null
  contactName?: string | null
  contactPhone?: string | null
}

export type ExpenseRequest = {
  routeId: number
  category: string
  amount: number
  currency: string
  exchangeRate?: number | null
  amountRsd?: number | null
  description?: string
  expenseDate: string
}

// ── Filter types ────────────────────────────────────────────
export type RouteFilter = {
  status?: string
  routeType?: string
  partnerId?: string
  search?: string
  sortBy?: string
  sortDir?: string
  page?: number
  size?: number
}
