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

export type DriverPage = {
  content: Array<Driver>
  number: Scalars['Int']['output']
  size: Scalars['Int']['output']
  totalElements: Scalars['Int']['output']
  totalPages: Scalars['Int']['output']
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

export type PerDiemRate = {
  countryCode: Scalars['String']['output']
  countryNameSr: Scalars['String']['output']
  currency: Scalars['String']['output']
  dailyAmount: Scalars['BigDecimal']['output']
}

export type Query = {
  driver?: Maybe<Driver>
  drivers: DriverPage
  exchangeRates: Array<ExchangeRate>
  expenseSummary: Array<ExpenseSummaryItem>
  expiringDocuments: Array<ExpiringDocument>
  fuelTanks: Array<FuelTank>
  invoice?: Maybe<Invoice>
  invoices: InvoicePage
  partners: PartnerPage
  perDiemRates: Array<PerDiemRate>
  /** Liveness probe — returns 'pong'. */
  ping: Scalars['String']['output']
  route?: Maybe<Route>
  routes: RoutePage
  trailers: TrailerPage
  vehicle?: Maybe<Vehicle>
  vehicles: VehiclePage
}

export type QueryDriverArgs = {
  id: Scalars['ID']['input']
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

export type QueryInvoiceArgs = {
  id: Scalars['ID']['input']
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

export type QueryPartnersArgs = {
  page?: InputMaybe<Scalars['Int']['input']>
  partnerType?: InputMaybe<Scalars['String']['input']>
  search?: InputMaybe<Scalars['String']['input']>
  size?: InputMaybe<Scalars['Int']['input']>
  sortBy?: InputMaybe<Scalars['String']['input']>
  sortDir?: InputMaybe<Scalars['String']['input']>
}

export type QueryRouteArgs = {
  id: Scalars['ID']['input']
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

export type QueryTrailersArgs = {
  page?: InputMaybe<Scalars['Int']['input']>
  size?: InputMaybe<Scalars['Int']['input']>
  sortBy?: InputMaybe<Scalars['String']['input']>
  sortDir?: InputMaybe<Scalars['String']['input']>
}

export type QueryVehicleArgs = {
  id: Scalars['ID']['input']
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

export type VehiclePage = {
  content: Array<Vehicle>
  number: Scalars['Int']['output']
  size: Scalars['Int']['output']
  totalElements: Scalars['Int']['output']
  totalPages: Scalars['Int']['output']
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
      city?: string | null
      partnerType: string
      phone?: string | null
      email?: string | null
      contactPerson?: string | null
    }>
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
