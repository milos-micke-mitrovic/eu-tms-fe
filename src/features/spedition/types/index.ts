// ── Route ─────────────────────────────────────────────────

export type RouteStatus =
  | 'CREATED'
  | 'DISPATCHED'
  | 'IN_TRANSIT'
  | 'COMPLETED'
  | 'INVOICED'
  | 'PAID'
  | 'CANCELLED'

export type RouteType = 'DOMESTIC' | 'INTERNATIONAL'

export type Route = {
  id: number
  internalNumber: string
  routeType: RouteType
  status: RouteStatus
  partner: { id: number; name: string } | null
  vehicle: { id: number; regNumber: string } | null
  driver: { id: number; firstName: string; lastName: string } | null
  departureDate: string | null
  returnDate: string | null
  cargoDescription: string | null
  cargoWeightKg: number | null
  cargoVolumeM3: number | null
  price: number | null
  currency: string | null
  distanceKm: number | null
  notes: string | null
  stops: RouteStop[]
  expenses: RouteExpense[]
  totalExpenseRsd: number | null
  profit: number | null
}

export type RouteRequest = {
  routeType: RouteType
  partnerId: number
  vehicleId: number
  driverId?: number | null
  departureDate?: string | null
  returnDate?: string | null
  cargoDescription?: string | null
  cargoWeightKg?: number | null
  cargoVolumeM3?: number | null
  price?: number | null
  currency?: string | null
  distanceKm?: number | null
  notes?: string | null
}

export type RouteFilter = {
  status?: string
  search?: string
  page?: number
  size?: number
}

// ── Route Stop ───────────────────────────────────────────

export type RouteStop = {
  id: number
  stopOrder: number
  stopType: string
  address: string
  city: string
  countryCode: string
  plannedArrival: string | null
  actualArrival: string | null
}

// ── Expense ──────────────────────────────────────────────

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

export type RouteExpense = {
  id: number
  category: ExpenseCategory
  amount: number
  currency: string
  amountRsd: number
  description: string | null
  expenseDate: string
  status: string
}

export type ExpenseRequest = {
  routeId: number
  category: ExpenseCategory
  amount: number
  currency: string
  description?: string | null
  expenseDate: string
}

export type ExpenseSummaryItem = {
  key: string
  totalAmountRsd: number
}
