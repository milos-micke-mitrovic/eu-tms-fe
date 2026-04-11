export type ReportFormat = 'pdf' | 'xlsx'
export type ProfitabilityGroupBy = 'route' | 'vehicle' | 'partner'

export type FuelConsumptionTrend = {
  vehicleId: string
  regNumber: string
  month: string
  avgLitersPer100km: number
}

export type DriverFuelComparison = {
  driverId: string
  driverName: string
  avgLitersPer100km: number
  totalKm: number
  totalLiters: number
}

export type CostPerKm = {
  vehicleId: string
  regNumber: string
  totalExpenseRsd: number
  totalDistanceKm: number
  costPerKmRsd: number
}

export type VehicleUtilization = {
  vehicleId: string
  regNumber: string
  daysInPeriod: number
  daysOnRoad: number
  utilizationPercent: number
}

export type TopRoute = {
  routeId: string
  internalNumber: string
  partnerName: string
  vehicleRegNumber: string
  revenue: number
  expenses: number
  profit: number
  marginPercent: number
}

export type MonthlyPnl = {
  month: string
  revenue: number
  expenses: number
  profit: number
}

export type AgingBucket = {
  bucket: string
  invoiceCount: number
  totalAmount: number
  currency: string
}

export type TopDebtor = {
  partnerId: string
  partnerName: string
  totalDebt: number
  invoiceCount: number
  oldestDueDate: string
  avgDaysOverdue: number
}

export type RouteCountByPartner = {
  partnerId: string
  partnerName: string
  routeCount: number
  totalRevenue: number
}

export type DriverProductivity = {
  driverId: string
  driverName: string
  routeCount: number
  totalRevenue: number
  totalProfit: number
  daysOnRoad: number
}
