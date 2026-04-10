// ── Route ─────────────────────────────────────────────────

export type RouteStatus = 'CREATED' | 'DISPATCHED' | 'IN_TRANSIT' | 'COMPLETED' | 'INVOICED' | 'PAID' | 'CANCELLED'
export type RouteType = 'DOMESTIC' | 'INTERNATIONAL'

export type Route = {
  id: number
  internalNumber: string
  routeType: RouteType
  status: RouteStatus
  partnerId: number | null
  partner: { id: number; name: string; pib: string; city: string } | null
  vehicleId: number | null
  vehicle: { id: number; regNumber: string; make: string; model: string } | null
  driverId: number | null
  driver: { id: number; firstName: string; lastName: string; phone: string } | null
  trailerId: number | null
  departureDate: string | null
  returnDate: string | null
  cargoDescription: string | null
  cargoWeightKg: number | null
  cargoVolumeM3: number | null
  price: number | null
  currency: string
  distanceKm: number | null
  notes: string | null
  stops: RouteStop[]
  expenses: RouteExpense[]
  totalExpenseRsd: number | null
  profit: number | null
  createdAt: string
}

export type RouteRequest = {
  routeType: string
  partnerId: number | null
  vehicleId: number | null
  driverId?: number | null
  trailerId?: number | null
  departureDate?: string | null
  returnDate?: string | null
  cargoDescription?: string
  cargoWeightKg?: number | null
  cargoVolumeM3?: number | null
  price?: number | null
  currency?: string
  distanceKm?: number | null
  notes?: string
  stops?: RouteStopRequest[]
}

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

// ── Route Stop ───────────────────────────────────────────

export type StopType = 'LOADING' | 'UNLOADING' | 'BORDER' | 'CUSTOMS' | 'REST' | 'FUEL' | 'OTHER'

export type RouteStop = {
  id: number
  stopOrder: number
  stopType: StopType
  address: string | null
  city: string | null
  countryCode: string
  zipCode: string | null
  plannedArrival: string | null
  actualArrival: string | null
  plannedDeparture: string | null
  actualDeparture: string | null
  notes: string | null
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
}

// ── Expense ──────────────────────────────────────────────

export type ExpenseCategory =
  | 'FUEL' | 'TOLL_DOMESTIC' | 'TOLL_INTERNATIONAL' | 'PER_DIEM'
  | 'PARKING' | 'VIGNETTE' | 'CUSTOMS' | 'BORDER_FEE'
  | 'FERRY' | 'MAINTENANCE' | 'WASH' | 'PHONE' | 'FINE' | 'OTHER'

export type ExpenseStatus = 'MANUAL' | 'AUTO' | 'SUGGESTED' | 'CONFIRMED' | 'REJECTED'

export type RouteExpense = {
  id: number
  category: ExpenseCategory
  amount: number
  currency: string
  exchangeRate: number | null
  amountRsd: number | null
  description: string | null
  expenseDate: string
  status: ExpenseStatus
  createdAt: string
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

export type ExpenseSummaryItem = {
  key: string
  totalAmountRsd: number
}
