export type Maybe<T> = T | null
export type InputMaybe<T> = T | null
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K]
}
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>
}
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>
}
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never }
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never
    }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string }
  String: { input: string; output: string }
  Boolean: { input: boolean; output: boolean }
  Int: { input: number; output: number }
  Float: { input: number; output: number }
  BigDecimal: { input: number; output: number }
  Date: { input: string; output: string }
  DateTime: { input: string; output: string }
}

export type AgingBucket = {
  bucket: Scalars['String']['output']
  currency: Scalars['String']['output']
  invoiceCount: Scalars['Int']['output']
  totalAmount: Scalars['BigDecimal']['output']
}

export type CategoryAmount = {
  category: Scalars['String']['output']
  totalAmountRsd: Scalars['BigDecimal']['output']
}

export type CollectionStats = {
  avgCollectionDays: Scalars['Int']['output']
  collectionRate: Scalars['BigDecimal']['output']
  overdueCount: Scalars['Int']['output']
  totalCollected: Scalars['BigDecimal']['output']
  totalInvoiced: Scalars['BigDecimal']['output']
  totalOverdue: Scalars['BigDecimal']['output']
}

export type CostPerKm = {
  costPerKmRsd: Scalars['BigDecimal']['output']
  regNumber: Scalars['String']['output']
  totalDistanceKm: Scalars['Int']['output']
  totalExpenseRsd: Scalars['BigDecimal']['output']
  vehicleId: Scalars['ID']['output']
}

export type Dashboard = {
  activeRoutesCount: Scalars['Int']['output']
  completedRoutesThisMonth: Scalars['Int']['output']
  expenseTrendMonthly: Array<MonthlyAmount>
  expensesByCategory: Array<CategoryAmount>
  expiringDocuments: Array<ExpiringDocumentSummary>
  expiringPermits: Array<PermitSummary>
  fleetSummary: FleetSummary
  monthlyExpenseTotal: Scalars['BigDecimal']['output']
  monthlyRevenueTotal: Scalars['BigDecimal']['output']
  overdueInvoices: Array<OverdueInvoiceSummary>
  profitThisMonth: Scalars['BigDecimal']['output']
  recentNotifications: Array<NotificationSummary>
  recentRoutes: Array<RouteSummary>
  topVehiclesByExpense: Array<VehicleExpense>
}

export type Driver = {
  adrCertificate?: Maybe<Scalars['Boolean']['output']>
  adrExpiry?: Maybe<Scalars['Date']['output']>
  birthDate?: Maybe<Scalars['Date']['output']>
  companyId?: Maybe<Scalars['ID']['output']>
  createdAt?: Maybe<Scalars['DateTime']['output']>
  documents: Array<DriverDocument>
  email?: Maybe<Scalars['String']['output']>
  employmentDate?: Maybe<Scalars['Date']['output']>
  firstName: Scalars['String']['output']
  healthCheckExpiry?: Maybe<Scalars['Date']['output']>
  id: Scalars['ID']['output']
  jmbg?: Maybe<Scalars['String']['output']>
  lastName: Scalars['String']['output']
  licenseCategories?: Maybe<Scalars['String']['output']>
  licenseNumber?: Maybe<Scalars['String']['output']>
  phone?: Maybe<Scalars['String']['output']>
  status: Scalars['String']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  vehicleId?: Maybe<Scalars['ID']['output']>
  vehicleRegNumber?: Maybe<Scalars['String']['output']>
}

export type DriverDocument = {
  createdAt?: Maybe<Scalars['DateTime']['output']>
  documentType: Scalars['String']['output']
  expirationDate?: Maybe<Scalars['Date']['output']>
  id: Scalars['ID']['output']
  notes?: Maybe<Scalars['String']['output']>
  originalFilename?: Maybe<Scalars['String']['output']>
}

export type DriverFuelComparison = {
  avgLitersPer100km: Scalars['BigDecimal']['output']
  driverId: Scalars['ID']['output']
  driverName: Scalars['String']['output']
  totalKm: Scalars['Int']['output']
  totalLiters: Scalars['BigDecimal']['output']
}

export type DriverPage = {
  content: Array<Driver>
  number: Scalars['Int']['output']
  size: Scalars['Int']['output']
  totalElements: Scalars['Int']['output']
  totalPages: Scalars['Int']['output']
}

export type DriverProductivity = {
  daysOnRoad: Scalars['Int']['output']
  driverId: Scalars['ID']['output']
  driverName: Scalars['String']['output']
  routeCount: Scalars['Int']['output']
  totalProfit: Scalars['BigDecimal']['output']
  totalRevenue: Scalars['BigDecimal']['output']
}

export type ExchangeRate = {
  currencyCode: Scalars['String']['output']
  rateDate: Scalars['Date']['output']
  rateToRsd: Scalars['BigDecimal']['output']
}

export type ExpenseSummaryItem = {
  key: Scalars['String']['output']
  totalAmountRsd: Scalars['BigDecimal']['output']
}

export type ExpiringDocument = {
  daysUntilExpiry: Scalars['Int']['output']
  documentType: Scalars['String']['output']
  entityName: Scalars['String']['output']
  entityType: Scalars['String']['output']
  expirationDate: Scalars['Date']['output']
  id: Scalars['ID']['output']
}

export type ExpiringDocumentSummary = {
  daysUntilExpiry: Scalars['Int']['output']
  documentType: Scalars['String']['output']
  entityId: Scalars['ID']['output']
  entityName: Scalars['String']['output']
  entityType: Scalars['String']['output']
  expirationDate: Scalars['Date']['output']
}

export type FleetSummary = {
  activeDrivers: Scalars['Int']['output']
  activeVehicles: Scalars['Int']['output']
  totalDrivers: Scalars['Int']['output']
  totalVehicles: Scalars['Int']['output']
}

export type FuelConsumptionTrend = {
  avgLitersPer100km: Scalars['BigDecimal']['output']
  month: Scalars['String']['output']
  regNumber: Scalars['String']['output']
  vehicleId: Scalars['ID']['output']
}

export type FuelTank = {
  capacityLiters: Scalars['BigDecimal']['output']
  createdAt?: Maybe<Scalars['DateTime']['output']>
  currentLevelLiters: Scalars['BigDecimal']['output']
  fuelType: Scalars['String']['output']
  id: Scalars['ID']['output']
  location?: Maybe<Scalars['String']['output']>
  name: Scalars['String']['output']
  percentFull?: Maybe<Scalars['BigDecimal']['output']>
}

export type Invoice = {
  createdAt?: Maybe<Scalars['DateTime']['output']>
  currency: Scalars['String']['output']
  dueDate: Scalars['Date']['output']
  id: Scalars['ID']['output']
  invoiceDate: Scalars['Date']['output']
  invoiceNumber: Scalars['String']['output']
  items: Array<InvoiceItem>
  notes?: Maybe<Scalars['String']['output']>
  partner?: Maybe<Partner>
  partnerId: Scalars['ID']['output']
  paymentStatus: Scalars['String']['output']
  relatedRouteIds?: Maybe<Array<Maybe<Scalars['ID']['output']>>>
  subtotal: Scalars['BigDecimal']['output']
  total: Scalars['BigDecimal']['output']
  vatAmount: Scalars['BigDecimal']['output']
  vatRate: Scalars['BigDecimal']['output']
}

export type InvoiceItem = {
  description: Scalars['String']['output']
  id: Scalars['ID']['output']
  quantity: Scalars['BigDecimal']['output']
  total: Scalars['BigDecimal']['output']
  unit?: Maybe<Scalars['String']['output']>
  unitPrice: Scalars['BigDecimal']['output']
}

export type InvoicePage = {
  content: Array<Invoice>
  number: Scalars['Int']['output']
  size: Scalars['Int']['output']
  totalElements: Scalars['Int']['output']
  totalPages: Scalars['Int']['output']
}

export type MonthlyAmount = {
  month: Scalars['String']['output']
  totalAmountRsd: Scalars['BigDecimal']['output']
}

export type MonthlyPnl = {
  expenses: Scalars['BigDecimal']['output']
  month: Scalars['String']['output']
  profit: Scalars['BigDecimal']['output']
  revenue: Scalars['BigDecimal']['output']
}

export type NotificationSummary = {
  createdAt: Scalars['DateTime']['output']
  id: Scalars['ID']['output']
  message: Scalars['String']['output']
  read: Scalars['Boolean']['output']
  title: Scalars['String']['output']
}

export type OverdueInvoiceSummary = {
  currency: Scalars['String']['output']
  daysOverdue: Scalars['Int']['output']
  id: Scalars['ID']['output']
  invoiceNumber: Scalars['String']['output']
  partnerName: Scalars['String']['output']
  total: Scalars['BigDecimal']['output']
}

export type Partner = {
  address?: Maybe<Scalars['String']['output']>
  bankAccount?: Maybe<Scalars['String']['output']>
  city?: Maybe<Scalars['String']['output']>
  contactPerson?: Maybe<Scalars['String']['output']>
  country?: Maybe<Scalars['String']['output']>
  createdAt?: Maybe<Scalars['DateTime']['output']>
  email?: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  maticniBroj?: Maybe<Scalars['String']['output']>
  name: Scalars['String']['output']
  notes?: Maybe<Scalars['String']['output']>
  partnerType: Scalars['String']['output']
  phone?: Maybe<Scalars['String']['output']>
  pib?: Maybe<Scalars['String']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  zipCode?: Maybe<Scalars['String']['output']>
}

export type PartnerPage = {
  content: Array<Partner>
  number: Scalars['Int']['output']
  size: Scalars['Int']['output']
  totalElements: Scalars['Int']['output']
  totalPages: Scalars['Int']['output']
}

export type PartnerProfitability = {
  partnerId: Scalars['ID']['output']
  partnerName: Scalars['String']['output']
  profit: Scalars['BigDecimal']['output']
  routeCount: Scalars['Int']['output']
  totalExpenses: Scalars['BigDecimal']['output']
  totalRevenue: Scalars['BigDecimal']['output']
}

export type PerDiemRate = {
  countryCode: Scalars['String']['output']
  countryNameSr: Scalars['String']['output']
  currency: Scalars['String']['output']
  dailyAmount: Scalars['BigDecimal']['output']
}

export type PermitSummary = {
  countryName?: Maybe<Scalars['String']['output']>
  daysUntilExpiry: Scalars['Int']['output']
  id: Scalars['ID']['output']
  permitNumber: Scalars['String']['output']
  permitType: Scalars['String']['output']
  validTo: Scalars['Date']['output']
}

export type ProfitabilityPage = {
  content: Array<RouteProfitability>
  number: Scalars['Int']['output']
  size: Scalars['Int']['output']
  totalElements: Scalars['Int']['output']
  totalPages: Scalars['Int']['output']
}

export type Query = {
  agingAnalysis: Array<AgingBucket>
  costPerKm: Array<CostPerKm>
  dashboard: Dashboard
  driver?: Maybe<Driver>
  driverFuelComparison: Array<DriverFuelComparison>
  driverProductivity: Array<DriverProductivity>
  drivers: DriverPage
  exchangeRates: Array<ExchangeRate>
  expenseSummary: Array<ExpenseSummaryItem>
  expiringDocuments: Array<ExpiringDocument>
  fuelConsumptionAllVehicles: Array<FuelConsumptionTrend>
  fuelConsumptionTrend: Array<FuelConsumptionTrend>
  fuelTanks: Array<FuelTank>
  invoice?: Maybe<Invoice>
  invoiceCollectionStats: CollectionStats
  invoices: InvoicePage
  monthlyPnl: Array<MonthlyPnl>
  partners: PartnerPage
  perDiemRates: Array<PerDiemRate>
  /** Liveness probe — returns 'pong'. */
  ping: Scalars['String']['output']
  profitabilityByPartner: Array<PartnerProfitability>
  profitabilityByRoute: ProfitabilityPage
  profitabilityByVehicle: Array<VehicleProfitability>
  route?: Maybe<Route>
  routeCountByPartner: Array<RouteCountByPartner>
  routes: RoutePage
  topDebtors: Array<TopDebtor>
  topProfitableRoutes: Array<TopRoute>
  trailers: TrailerPage
  vehicle?: Maybe<Vehicle>
  vehicleUtilization: Array<VehicleUtilization>
  vehicles: VehiclePage
}

export type QueryCostPerKmArgs = {
  from: Scalars['Date']['input']
  to: Scalars['Date']['input']
}

export type QueryDriverArgs = {
  id: Scalars['ID']['input']
}

export type QueryDriverFuelComparisonArgs = {
  from: Scalars['Date']['input']
  to: Scalars['Date']['input']
}

export type QueryDriverProductivityArgs = {
  from: Scalars['Date']['input']
  to: Scalars['Date']['input']
}

export type QueryDriversArgs = {
  companyId?: InputMaybe<Scalars['ID']['input']>
  page?: InputMaybe<Scalars['Int']['input']>
  search?: InputMaybe<Scalars['String']['input']>
  size?: InputMaybe<Scalars['Int']['input']>
  sortBy?: InputMaybe<Scalars['String']['input']>
  sortDir?: InputMaybe<Scalars['String']['input']>
  status?: InputMaybe<Scalars['String']['input']>
}

export type QueryExchangeRatesArgs = {
  date?: InputMaybe<Scalars['Date']['input']>
}

export type QueryExpenseSummaryArgs = {
  from: Scalars['Date']['input']
  groupBy: Scalars['String']['input']
  to: Scalars['Date']['input']
}

export type QueryExpiringDocumentsArgs = {
  days: Scalars['Int']['input']
}

export type QueryFuelConsumptionAllVehiclesArgs = {
  from: Scalars['Date']['input']
  to: Scalars['Date']['input']
}

export type QueryFuelConsumptionTrendArgs = {
  from: Scalars['Date']['input']
  to: Scalars['Date']['input']
  vehicleId: Scalars['ID']['input']
}

export type QueryInvoiceArgs = {
  id: Scalars['ID']['input']
}

export type QueryInvoiceCollectionStatsArgs = {
  from: Scalars['Date']['input']
  to: Scalars['Date']['input']
}

export type QueryInvoicesArgs = {
  dateFrom?: InputMaybe<Scalars['Date']['input']>
  dateTo?: InputMaybe<Scalars['Date']['input']>
  page?: InputMaybe<Scalars['Int']['input']>
  partnerId?: InputMaybe<Scalars['ID']['input']>
  search?: InputMaybe<Scalars['String']['input']>
  size?: InputMaybe<Scalars['Int']['input']>
  sortBy?: InputMaybe<Scalars['String']['input']>
  sortDir?: InputMaybe<Scalars['String']['input']>
  status?: InputMaybe<Scalars['String']['input']>
}

export type QueryMonthlyPnlArgs = {
  from: Scalars['Date']['input']
  to: Scalars['Date']['input']
}

export type QueryPartnersArgs = {
  page?: InputMaybe<Scalars['Int']['input']>
  partnerType?: InputMaybe<Scalars['String']['input']>
  search?: InputMaybe<Scalars['String']['input']>
  size?: InputMaybe<Scalars['Int']['input']>
  sortBy?: InputMaybe<Scalars['String']['input']>
  sortDir?: InputMaybe<Scalars['String']['input']>
}

export type QueryProfitabilityByPartnerArgs = {
  from: Scalars['Date']['input']
  to: Scalars['Date']['input']
}

export type QueryProfitabilityByRouteArgs = {
  from: Scalars['Date']['input']
  page?: InputMaybe<Scalars['Int']['input']>
  size?: InputMaybe<Scalars['Int']['input']>
  to: Scalars['Date']['input']
}

export type QueryProfitabilityByVehicleArgs = {
  from: Scalars['Date']['input']
  to: Scalars['Date']['input']
}

export type QueryRouteArgs = {
  id: Scalars['ID']['input']
}

export type QueryRouteCountByPartnerArgs = {
  from: Scalars['Date']['input']
  to: Scalars['Date']['input']
}

export type QueryRoutesArgs = {
  dateFrom?: InputMaybe<Scalars['Date']['input']>
  dateTo?: InputMaybe<Scalars['Date']['input']>
  driverId?: InputMaybe<Scalars['ID']['input']>
  page?: InputMaybe<Scalars['Int']['input']>
  partnerId?: InputMaybe<Scalars['ID']['input']>
  routeType?: InputMaybe<Scalars['String']['input']>
  search?: InputMaybe<Scalars['String']['input']>
  size?: InputMaybe<Scalars['Int']['input']>
  sortBy?: InputMaybe<Scalars['String']['input']>
  sortDir?: InputMaybe<Scalars['String']['input']>
  status?: InputMaybe<Scalars['String']['input']>
  vehicleId?: InputMaybe<Scalars['ID']['input']>
}

export type QueryTopDebtorsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>
}

export type QueryTopProfitableRoutesArgs = {
  from: Scalars['Date']['input']
  limit?: InputMaybe<Scalars['Int']['input']>
  to: Scalars['Date']['input']
}

export type QueryTrailersArgs = {
  page?: InputMaybe<Scalars['Int']['input']>
  size?: InputMaybe<Scalars['Int']['input']>
  sortBy?: InputMaybe<Scalars['String']['input']>
  sortDir?: InputMaybe<Scalars['String']['input']>
}

export type QueryVehicleArgs = {
  id: Scalars['ID']['input']
}

export type QueryVehicleUtilizationArgs = {
  from: Scalars['Date']['input']
  to: Scalars['Date']['input']
}

export type QueryVehiclesArgs = {
  page?: InputMaybe<Scalars['Int']['input']>
  search?: InputMaybe<Scalars['String']['input']>
  size?: InputMaybe<Scalars['Int']['input']>
  sortBy?: InputMaybe<Scalars['String']['input']>
  sortDir?: InputMaybe<Scalars['String']['input']>
  status?: InputMaybe<Scalars['String']['input']>
  vehicleType?: InputMaybe<Scalars['String']['input']>
}

export type Route = {
  cargoDescription?: Maybe<Scalars['String']['output']>
  cargoVolumeM3?: Maybe<Scalars['BigDecimal']['output']>
  cargoWeightKg?: Maybe<Scalars['BigDecimal']['output']>
  createdAt?: Maybe<Scalars['DateTime']['output']>
  currency?: Maybe<Scalars['String']['output']>
  departureDate?: Maybe<Scalars['Date']['output']>
  distanceKm?: Maybe<Scalars['Int']['output']>
  driver?: Maybe<Driver>
  driverId?: Maybe<Scalars['ID']['output']>
  expenses: Array<RouteExpense>
  id: Scalars['ID']['output']
  internalNumber: Scalars['String']['output']
  notes?: Maybe<Scalars['String']['output']>
  partner?: Maybe<Partner>
  partnerId?: Maybe<Scalars['ID']['output']>
  price?: Maybe<Scalars['BigDecimal']['output']>
  profit?: Maybe<Scalars['BigDecimal']['output']>
  returnDate?: Maybe<Scalars['Date']['output']>
  routeType: Scalars['String']['output']
  status: Scalars['String']['output']
  stops: Array<RouteStop>
  totalExpenseRsd?: Maybe<Scalars['BigDecimal']['output']>
  trailerId?: Maybe<Scalars['ID']['output']>
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  vehicle?: Maybe<Vehicle>
  vehicleId?: Maybe<Scalars['ID']['output']>
}

export type RouteCountByPartner = {
  partnerId: Scalars['ID']['output']
  partnerName: Scalars['String']['output']
  routeCount: Scalars['Int']['output']
  totalRevenue: Scalars['BigDecimal']['output']
}

export type RouteExpense = {
  amount: Scalars['BigDecimal']['output']
  amountRsd?: Maybe<Scalars['BigDecimal']['output']>
  category: Scalars['String']['output']
  createdAt?: Maybe<Scalars['DateTime']['output']>
  currency: Scalars['String']['output']
  description?: Maybe<Scalars['String']['output']>
  exchangeRate?: Maybe<Scalars['BigDecimal']['output']>
  expenseDate: Scalars['Date']['output']
  id: Scalars['ID']['output']
  status: Scalars['String']['output']
}

export type RoutePage = {
  content: Array<Route>
  number: Scalars['Int']['output']
  size: Scalars['Int']['output']
  totalElements: Scalars['Int']['output']
  totalPages: Scalars['Int']['output']
}

export type RouteProfitability = {
  expenses: Scalars['BigDecimal']['output']
  internalNumber: Scalars['String']['output']
  marginPercent: Scalars['BigDecimal']['output']
  partnerName?: Maybe<Scalars['String']['output']>
  profit: Scalars['BigDecimal']['output']
  revenue: Scalars['BigDecimal']['output']
  routeId: Scalars['ID']['output']
  vehicleRegNumber?: Maybe<Scalars['String']['output']>
}

export type RouteStop = {
  actualArrival?: Maybe<Scalars['DateTime']['output']>
  actualDeparture?: Maybe<Scalars['DateTime']['output']>
  address?: Maybe<Scalars['String']['output']>
  city?: Maybe<Scalars['String']['output']>
  countryCode: Scalars['String']['output']
  id: Scalars['ID']['output']
  notes?: Maybe<Scalars['String']['output']>
  plannedArrival?: Maybe<Scalars['DateTime']['output']>
  plannedDeparture?: Maybe<Scalars['DateTime']['output']>
  stopOrder: Scalars['Int']['output']
  stopType: Scalars['String']['output']
  zipCode?: Maybe<Scalars['String']['output']>
}

export type RouteSummary = {
  currency?: Maybe<Scalars['String']['output']>
  departureDate?: Maybe<Scalars['Date']['output']>
  id: Scalars['ID']['output']
  internalNumber: Scalars['String']['output']
  partnerName?: Maybe<Scalars['String']['output']>
  price?: Maybe<Scalars['BigDecimal']['output']>
  status: Scalars['String']['output']
}

export type TopDebtor = {
  avgDaysOverdue: Scalars['Int']['output']
  invoiceCount: Scalars['Int']['output']
  oldestDueDate: Scalars['Date']['output']
  partnerId: Scalars['ID']['output']
  partnerName: Scalars['String']['output']
  totalDebt: Scalars['BigDecimal']['output']
}

export type TopRoute = {
  expenses: Scalars['BigDecimal']['output']
  internalNumber: Scalars['String']['output']
  marginPercent: Scalars['BigDecimal']['output']
  partnerName?: Maybe<Scalars['String']['output']>
  profit: Scalars['BigDecimal']['output']
  revenue: Scalars['BigDecimal']['output']
  routeId: Scalars['ID']['output']
  vehicleRegNumber?: Maybe<Scalars['String']['output']>
}

export type Trailer = {
  capacityKg?: Maybe<Scalars['BigDecimal']['output']>
  createdAt?: Maybe<Scalars['DateTime']['output']>
  id: Scalars['ID']['output']
  lengthM?: Maybe<Scalars['BigDecimal']['output']>
  ownership: Scalars['String']['output']
  regNumber: Scalars['String']['output']
  status: Scalars['String']['output']
  type: Scalars['String']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  year?: Maybe<Scalars['Int']['output']>
}

export type TrailerPage = {
  content: Array<Trailer>
  number: Scalars['Int']['output']
  size: Scalars['Int']['output']
  totalElements: Scalars['Int']['output']
  totalPages: Scalars['Int']['output']
}

export type Vehicle = {
  avgConsumptionL100km?: Maybe<Scalars['BigDecimal']['output']>
  cargoCapacityKg?: Maybe<Scalars['BigDecimal']['output']>
  cargoVolumeM3?: Maybe<Scalars['BigDecimal']['output']>
  createdAt?: Maybe<Scalars['DateTime']['output']>
  currentDriverId?: Maybe<Scalars['ID']['output']>
  currentDriverName?: Maybe<Scalars['String']['output']>
  documents: Array<VehicleDocument>
  fuelType: Scalars['String']['output']
  id: Scalars['ID']['output']
  make?: Maybe<Scalars['String']['output']>
  model?: Maybe<Scalars['String']['output']>
  odometerKm?: Maybe<Scalars['Int']['output']>
  ownership: Scalars['String']['output']
  regNumber: Scalars['String']['output']
  status: Scalars['String']['output']
  updatedAt?: Maybe<Scalars['DateTime']['output']>
  vehicleType: Scalars['String']['output']
  vin?: Maybe<Scalars['String']['output']>
  year?: Maybe<Scalars['Int']['output']>
}

export type VehicleDocument = {
  createdAt?: Maybe<Scalars['DateTime']['output']>
  documentType: Scalars['String']['output']
  expirationDate?: Maybe<Scalars['Date']['output']>
  id: Scalars['ID']['output']
  notes?: Maybe<Scalars['String']['output']>
  originalFilename?: Maybe<Scalars['String']['output']>
}

export type VehicleExpense = {
  regNumber: Scalars['String']['output']
  totalAmountRsd: Scalars['BigDecimal']['output']
  vehicleId: Scalars['ID']['output']
}

export type VehiclePage = {
  content: Array<Vehicle>
  number: Scalars['Int']['output']
  size: Scalars['Int']['output']
  totalElements: Scalars['Int']['output']
  totalPages: Scalars['Int']['output']
}

export type VehicleProfitability = {
  avgProfitPerRoute: Scalars['BigDecimal']['output']
  profit: Scalars['BigDecimal']['output']
  regNumber: Scalars['String']['output']
  routeCount: Scalars['Int']['output']
  totalExpenses: Scalars['BigDecimal']['output']
  totalRevenue: Scalars['BigDecimal']['output']
  vehicleId: Scalars['ID']['output']
}

export type VehicleUtilization = {
  daysInPeriod: Scalars['Int']['output']
  daysOnRoad: Scalars['Int']['output']
  regNumber: Scalars['String']['output']
  utilizationPercent: Scalars['BigDecimal']['output']
  vehicleId: Scalars['ID']['output']
}

export type DashboardQueryVariables = Exact<{ [key: string]: never }>

export type DashboardQuery = {
  dashboard: {
    activeRoutesCount: number
    completedRoutesThisMonth: number
    monthlyExpenseTotal: number
    monthlyRevenueTotal: number
    profitThisMonth: number
    expensesByCategory: Array<{ category: string; totalAmountRsd: number }>
    expenseTrendMonthly: Array<{ month: string; totalAmountRsd: number }>
    topVehiclesByExpense: Array<{
      vehicleId: string
      regNumber: string
      totalAmountRsd: number
    }>
    expiringPermits: Array<{
      id: string
      permitType: string
      permitNumber: string
      countryName?: string | null
      validTo: string
      daysUntilExpiry: number
    }>
    expiringDocuments: Array<{
      entityType: string
      entityId: string
      entityName: string
      documentType: string
      expirationDate: string
      daysUntilExpiry: number
    }>
    overdueInvoices: Array<{
      id: string
      invoiceNumber: string
      partnerName: string
      total: number
      currency: string
      daysOverdue: number
    }>
    recentRoutes: Array<{
      id: string
      internalNumber: string
      status: string
      partnerName?: string | null
      departureDate?: string | null
      price?: number | null
      currency?: string | null
    }>
    recentNotifications: Array<{
      id: string
      title: string
      message: string
      read: boolean
      createdAt: string
    }>
    fleetSummary: {
      totalVehicles: number
      activeVehicles: number
      totalDrivers: number
      activeDrivers: number
    }
  }
}

export type GetExchangeRatesQueryVariables = Exact<{
  date?: InputMaybe<Scalars['Date']['input']>
}>

export type GetExchangeRatesQuery = {
  exchangeRates: Array<{
    currencyCode: string
    rateToRsd: number
    rateDate: string
  }>
}

export type GetInvoicesQueryVariables = Exact<{
  status?: InputMaybe<Scalars['String']['input']>
  partnerId?: InputMaybe<Scalars['ID']['input']>
  dateFrom?: InputMaybe<Scalars['Date']['input']>
  dateTo?: InputMaybe<Scalars['Date']['input']>
  search?: InputMaybe<Scalars['String']['input']>
  sortBy?: InputMaybe<Scalars['String']['input']>
  sortDir?: InputMaybe<Scalars['String']['input']>
  page?: InputMaybe<Scalars['Int']['input']>
  size?: InputMaybe<Scalars['Int']['input']>
}>

export type GetInvoicesQuery = {
  invoices: {
    totalElements: number
    totalPages: number
    number: number
    size: number
    content: Array<{
      id: string
      invoiceNumber: string
      paymentStatus: string
      invoiceDate: string
      dueDate: string
      currency: string
      total: number
      partner?: { id: string; name: string; pib?: string | null } | null
    }>
  }
}

export type GetInvoiceQueryVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type GetInvoiceQuery = {
  invoice?: {
    id: string
    invoiceNumber: string
    partnerId: string
    invoiceDate: string
    dueDate: string
    currency: string
    subtotal: number
    vatRate: number
    vatAmount: number
    total: number
    paymentStatus: string
    relatedRouteIds?: Array<string | null> | null
    notes?: string | null
    createdAt?: string | null
    partner?: {
      id: string
      name: string
      pib?: string | null
      city?: string | null
      address?: string | null
    } | null
    items: Array<{
      id: string
      description: string
      quantity: number
      unit?: string | null
      unitPrice: number
      total: number
    }>
  } | null
}

export type GetPerDiemRatesQueryVariables = Exact<{ [key: string]: never }>

export type GetPerDiemRatesQuery = {
  perDiemRates: Array<{
    countryCode: string
    countryNameSr: string
    dailyAmount: number
    currency: string
  }>
}

export type GetDriversQueryVariables = Exact<{
  status?: InputMaybe<Scalars['String']['input']>
  companyId?: InputMaybe<Scalars['ID']['input']>
  search?: InputMaybe<Scalars['String']['input']>
  sortBy?: InputMaybe<Scalars['String']['input']>
  sortDir?: InputMaybe<Scalars['String']['input']>
  page?: InputMaybe<Scalars['Int']['input']>
  size?: InputMaybe<Scalars['Int']['input']>
}>

export type GetDriversQuery = {
  drivers: {
    totalElements: number
    totalPages: number
    number: number
    size: number
    content: Array<{
      id: string
      firstName: string
      lastName: string
      jmbg?: string | null
      phone?: string | null
      licenseCategories?: string | null
      status: string
      vehicleId?: string | null
      vehicleRegNumber?: string | null
    }>
  }
}

export type GetDriverQueryVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type GetDriverQuery = {
  driver?: {
    id: string
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
    status: string
    companyId?: string | null
    vehicleId?: string | null
    vehicleRegNumber?: string | null
    documents: Array<{
      id: string
      documentType: string
      originalFilename?: string | null
      expirationDate?: string | null
      notes?: string | null
    }>
  } | null
}

export type GetTrailersQueryVariables = Exact<{
  sortBy?: InputMaybe<Scalars['String']['input']>
  sortDir?: InputMaybe<Scalars['String']['input']>
  page?: InputMaybe<Scalars['Int']['input']>
  size?: InputMaybe<Scalars['Int']['input']>
}>

export type GetTrailersQuery = {
  trailers: {
    totalElements: number
    totalPages: number
    number: number
    size: number
    content: Array<{
      id: string
      regNumber: string
      type: string
      lengthM?: number | null
      capacityKg?: number | null
      year?: number | null
      ownership: string
      status: string
    }>
  }
}

export type GetVehiclesQueryVariables = Exact<{
  status?: InputMaybe<Scalars['String']['input']>
  vehicleType?: InputMaybe<Scalars['String']['input']>
  search?: InputMaybe<Scalars['String']['input']>
  sortBy?: InputMaybe<Scalars['String']['input']>
  sortDir?: InputMaybe<Scalars['String']['input']>
  page?: InputMaybe<Scalars['Int']['input']>
  size?: InputMaybe<Scalars['Int']['input']>
}>

export type GetVehiclesQuery = {
  vehicles: {
    totalElements: number
    totalPages: number
    number: number
    size: number
    content: Array<{
      id: string
      regNumber: string
      make?: string | null
      model?: string | null
      year?: number | null
      vehicleType: string
      fuelType: string
      ownership: string
      status: string
      currentDriverId?: string | null
      currentDriverName?: string | null
      odometerKm?: number | null
    }>
  }
}

export type GetVehicleQueryVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type GetVehicleQuery = {
  vehicle?: {
    id: string
    regNumber: string
    make?: string | null
    model?: string | null
    year?: number | null
    vin?: string | null
    vehicleType: string
    fuelType: string
    ownership: string
    status: string
    cargoCapacityKg?: number | null
    cargoVolumeM3?: number | null
    avgConsumptionL100km?: number | null
    odometerKm?: number | null
    currentDriverId?: string | null
    currentDriverName?: string | null
    documents: Array<{
      id: string
      documentType: string
      originalFilename?: string | null
      expirationDate?: string | null
      notes?: string | null
    }>
  } | null
}

export type GetFuelTanksQueryVariables = Exact<{ [key: string]: never }>

export type GetFuelTanksQuery = {
  fuelTanks: Array<{
    id: string
    name: string
    capacityLiters: number
    currentLevelLiters: number
    fuelType: string
    location?: string | null
    percentFull?: number | null
  }>
}

export type GetPartnersQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>
  partnerType?: InputMaybe<Scalars['String']['input']>
  sortBy?: InputMaybe<Scalars['String']['input']>
  sortDir?: InputMaybe<Scalars['String']['input']>
  page?: InputMaybe<Scalars['Int']['input']>
  size?: InputMaybe<Scalars['Int']['input']>
}>

export type GetPartnersQuery = {
  partners: {
    totalElements: number
    totalPages: number
    number: number
    size: number
    content: Array<{
      id: string
      name: string
      pib?: string | null
      maticniBroj?: string | null
      address?: string | null
      city?: string | null
      country?: string | null
      zipCode?: string | null
      bankAccount?: string | null
      partnerType: string
      phone?: string | null
      email?: string | null
      contactPerson?: string | null
      notes?: string | null
    }>
  }
}

export type FuelConsumptionTrendQueryVariables = Exact<{
  vehicleId: Scalars['ID']['input']
  from: Scalars['Date']['input']
  to: Scalars['Date']['input']
}>

export type FuelConsumptionTrendQuery = {
  fuelConsumptionTrend: Array<{
    vehicleId: string
    regNumber: string
    month: string
    avgLitersPer100km: number
  }>
}

export type FuelConsumptionAllVehiclesQueryVariables = Exact<{
  from: Scalars['Date']['input']
  to: Scalars['Date']['input']
}>

export type FuelConsumptionAllVehiclesQuery = {
  fuelConsumptionAllVehicles: Array<{
    vehicleId: string
    regNumber: string
    month: string
    avgLitersPer100km: number
  }>
}

export type DriverFuelComparisonQueryVariables = Exact<{
  from: Scalars['Date']['input']
  to: Scalars['Date']['input']
}>

export type DriverFuelComparisonQuery = {
  driverFuelComparison: Array<{
    driverId: string
    driverName: string
    avgLitersPer100km: number
    totalKm: number
    totalLiters: number
  }>
}

export type CostPerKmQueryVariables = Exact<{
  from: Scalars['Date']['input']
  to: Scalars['Date']['input']
}>

export type CostPerKmQuery = {
  costPerKm: Array<{
    vehicleId: string
    regNumber: string
    totalExpenseRsd: number
    totalDistanceKm: number
    costPerKmRsd: number
  }>
}

export type VehicleUtilizationQueryVariables = Exact<{
  from: Scalars['Date']['input']
  to: Scalars['Date']['input']
}>

export type VehicleUtilizationQuery = {
  vehicleUtilization: Array<{
    vehicleId: string
    regNumber: string
    daysInPeriod: number
    daysOnRoad: number
    utilizationPercent: number
  }>
}

export type TopProfitableRoutesQueryVariables = Exact<{
  from: Scalars['Date']['input']
  to: Scalars['Date']['input']
  limit?: InputMaybe<Scalars['Int']['input']>
}>

export type TopProfitableRoutesQuery = {
  topProfitableRoutes: Array<{
    routeId: string
    internalNumber: string
    partnerName?: string | null
    vehicleRegNumber?: string | null
    revenue: number
    expenses: number
    profit: number
    marginPercent: number
  }>
}

export type MonthlyPnlQueryVariables = Exact<{
  from: Scalars['Date']['input']
  to: Scalars['Date']['input']
}>

export type MonthlyPnlQuery = {
  monthlyPnl: Array<{
    month: string
    revenue: number
    expenses: number
    profit: number
  }>
}

export type AgingAnalysisQueryVariables = Exact<{ [key: string]: never }>

export type AgingAnalysisQuery = {
  agingAnalysis: Array<{
    bucket: string
    invoiceCount: number
    totalAmount: number
    currency: string
  }>
}

export type TopDebtorsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>
}>

export type TopDebtorsQuery = {
  topDebtors: Array<{
    partnerId: string
    partnerName: string
    totalDebt: number
    invoiceCount: number
    oldestDueDate: string
    avgDaysOverdue: number
  }>
}

export type RouteCountByPartnerQueryVariables = Exact<{
  from: Scalars['Date']['input']
  to: Scalars['Date']['input']
}>

export type RouteCountByPartnerQuery = {
  routeCountByPartner: Array<{
    partnerId: string
    partnerName: string
    routeCount: number
    totalRevenue: number
  }>
}

export type DriverProductivityQueryVariables = Exact<{
  from: Scalars['Date']['input']
  to: Scalars['Date']['input']
}>

export type DriverProductivityQuery = {
  driverProductivity: Array<{
    driverId: string
    driverName: string
    routeCount: number
    totalRevenue: number
    totalProfit: number
    daysOnRoad: number
  }>
}

export type ProfitabilityByRouteQueryVariables = Exact<{
  from: Scalars['Date']['input']
  to: Scalars['Date']['input']
  page?: InputMaybe<Scalars['Int']['input']>
  size?: InputMaybe<Scalars['Int']['input']>
}>

export type ProfitabilityByRouteQuery = {
  profitabilityByRoute: {
    totalPages: number
    totalElements: number
    content: Array<{
      routeId: string
      internalNumber: string
      partnerName?: string | null
      vehicleRegNumber?: string | null
      revenue: number
      expenses: number
      profit: number
      marginPercent: number
    }>
  }
}

export type ProfitabilityByVehicleQueryVariables = Exact<{
  from: Scalars['Date']['input']
  to: Scalars['Date']['input']
}>

export type ProfitabilityByVehicleQuery = {
  profitabilityByVehicle: Array<{
    vehicleId: string
    regNumber: string
    routeCount: number
    totalRevenue: number
    totalExpenses: number
    profit: number
    avgProfitPerRoute: number
  }>
}

export type ProfitabilityByPartnerQueryVariables = Exact<{
  from: Scalars['Date']['input']
  to: Scalars['Date']['input']
}>

export type ProfitabilityByPartnerQuery = {
  profitabilityByPartner: Array<{
    partnerId: string
    partnerName: string
    routeCount: number
    totalRevenue: number
    totalExpenses: number
    profit: number
  }>
}

export type InvoiceCollectionStatsQueryVariables = Exact<{
  from: Scalars['Date']['input']
  to: Scalars['Date']['input']
}>

export type InvoiceCollectionStatsQuery = {
  invoiceCollectionStats: {
    totalInvoiced: number
    totalCollected: number
    totalOverdue: number
    collectionRate: number
    avgCollectionDays: number
    overdueCount: number
  }
}

export type ExpenseSummaryQueryVariables = Exact<{
  from: Scalars['Date']['input']
  to: Scalars['Date']['input']
  groupBy: Scalars['String']['input']
}>

export type ExpenseSummaryQuery = {
  expenseSummary: Array<{ key: string; totalAmountRsd: number }>
}

export type GetRouteQueryVariables = Exact<{
  id: Scalars['ID']['input']
}>

export type GetRouteQuery = {
  route?: {
    id: string
    internalNumber: string
    routeType: string
    status: string
    partnerId?: string | null
    vehicleId?: string | null
    driverId?: string | null
    trailerId?: string | null
    departureDate?: string | null
    returnDate?: string | null
    cargoDescription?: string | null
    cargoWeightKg?: number | null
    cargoVolumeM3?: number | null
    price?: number | null
    currency?: string | null
    distanceKm?: number | null
    notes?: string | null
    totalExpenseRsd?: number | null
    profit?: number | null
    partner?: {
      id: string
      name: string
      pib?: string | null
      city?: string | null
    } | null
    vehicle?: {
      id: string
      regNumber: string
      make?: string | null
      model?: string | null
    } | null
    driver?: {
      id: string
      firstName: string
      lastName: string
      phone?: string | null
    } | null
    stops: Array<{
      id: string
      stopOrder: number
      stopType: string
      address?: string | null
      city?: string | null
      countryCode: string
      zipCode?: string | null
      plannedArrival?: string | null
      actualArrival?: string | null
      plannedDeparture?: string | null
      actualDeparture?: string | null
      notes?: string | null
    }>
    expenses: Array<{
      id: string
      category: string
      amount: number
      currency: string
      exchangeRate?: number | null
      amountRsd?: number | null
      description?: string | null
      expenseDate: string
      status: string
    }>
  } | null
}

export type GetRoutesQueryVariables = Exact<{
  status?: InputMaybe<Scalars['String']['input']>
  routeType?: InputMaybe<Scalars['String']['input']>
  partnerId?: InputMaybe<Scalars['ID']['input']>
  search?: InputMaybe<Scalars['String']['input']>
  sortBy?: InputMaybe<Scalars['String']['input']>
  sortDir?: InputMaybe<Scalars['String']['input']>
  page?: InputMaybe<Scalars['Int']['input']>
  size?: InputMaybe<Scalars['Int']['input']>
}>

export type GetRoutesQuery = {
  routes: {
    totalElements: number
    totalPages: number
    number: number
    size: number
    content: Array<{
      id: string
      internalNumber: string
      routeType: string
      status: string
      departureDate?: string | null
      returnDate?: string | null
      price?: number | null
      currency?: string | null
      totalExpenseRsd?: number | null
      profit?: number | null
      partner?: { id: string; name: string } | null
      vehicle?: { id: string; regNumber: string } | null
      driver?: { id: string; firstName: string; lastName: string } | null
    }>
  }
}
