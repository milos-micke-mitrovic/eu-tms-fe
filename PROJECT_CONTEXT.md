# EU TMS Frontend — Full Project Context

## Project Overview

Frontend dashboard for a European TMS (Transport Management System) targeting Serbian spedition/logistics companies. Desktop-first (min 1024px), responsive. Built by a small team — one FE dev, one BE dev.

**Backend**: Spring Boot (Java), separate repo at `../eu-tms-be/`, runs on port 8080.
**Frontend**: React 19 SPA, runs on port 7445.

## Tech Stack

- **React 19** + **TypeScript** (strict) + **Vite 7** + **Tailwind CSS 4**
- **shadcn/ui** (New York style) + **Lucide icons**
- **Apollo Client 4** — GraphQL reads (lists, details, dashboard, statistics)
- **TanStack Query 5** — REST mutations (create, update, delete, upload) + permits listing
- **TanStack Table 8** — server-side pagination + sorting
- **React Hook Form 7** + **Zod 4** — form validation
- **Recharts 3** — charts/graphs
- **Leaflet** — maps
- **react-i18next** — i18n (Serbian default, English fallback)
- **date-fns** — date formatting
- **sonner** — toast notifications
- **react-router-dom 7** — routing with lazy loading
- **Vitest** — unit + integration tests (200+ unit, 73+ API)
- **pnpm** — package manager

## Architecture

```
src/
├── app/            # Layout, providers, routes
│   ├── layouts/    # DashboardLayout (sidebar + content), AppSidebar
│   ├── providers/  # AuthProvider, AppProviders (Apollo, QueryClient, Theme, i18n)
│   └── routes/     # Router config, RouteGuard, ErrorBoundary, NotFoundPage
├── features/       # Feature modules (each self-contained)
│   ├── auth/       # Login, JWT, token refresh
│   ├── dashboard/  # KPI cards, charts, alerts panel, fleet summary
│   ├── documents/  # CMR, travel orders (sub-feature of spedition)
│   ├── finance/    # Invoices, exchange rates
│   ├── fleet/      # Vehicles, drivers, trailers + documents
│   ├── fuel/       # Fuel tanks, transactions
│   ├── notifications/ # Bell popover in header
│   ├── partners/   # Clients, suppliers
│   ├── permits/    # Transport permits (CEMT, bilateral)
│   ├── reports/    # PDF/Excel downloads + profitability charts
│   ├── spedition/  # Routes (transport orders), expenses, stops
│   └── tenants/    # Tenant/company management (SUPER_ADMIN only)
├── generated/      # GraphQL codegen output (auto-generated types)
├── shared/         # Reusable components, hooks, utils, UI primitives
├── i18n/           # Translations (sr + en, 12 namespace files each)
├── styles/         # CSS variables (brand colors, dark mode)
└── test/           # Test setup + API integration tests
```

Each feature module follows:

```
feature/
├── api/        # GraphQL queries (Apollo) + REST mutations (TanStack)
├── components/ # Tables, forms, detail sheets
├── constants/  # Enums, category maps
├── pages/      # Page components
├── types/      # TypeScript types matching BE DTOs
└── schemas.ts  # Zod validation schemas
```

## Routing

All pages lazy-loaded with Suspense + ErrorBoundary. Three route groups:

1. **Public**: `/login` — no auth required
2. **SUPER_ADMIN**: `/tenants` — tenant management, separate layout (no sidebar)
3. **Protected**: All other pages — requires auth, uses DashboardLayout with sidebar

```
/dashboard, /routes, /expenses, /vehicles, /drivers, /trailers,
/partners, /fuel, /exchange-rates, /invoices, /permits, /reports, /statistics
```

`/` redirects to user's default route based on role (SUPER_ADMIN → /tenants, others → /dashboard).

## Authentication

- JWT-based with access + refresh tokens stored in `localStorage`
- `AuthProvider` context provides `user`, `token`, `isAuthenticated`, `login()`, `logout()`
- Proactive token refresh 60s before expiry with retry + exponential backoff
- Tab visibility check: if token expires within 5min when tab becomes active, refresh proactively
- `httpClient` handles 401/403 by attempting token refresh, then retrying the request
- Custom events: `auth:tokens-updated`, `auth:logout` for cross-component coordination
- `RouteGuard` component handles auth checks + role-based access (`allowedRoles` prop)

### User Roles

```typescript
type Role =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'MANAGER'
  | 'DISPATCHER'
  | 'DRIVER'
  | 'ACCOUNTING'
  | 'USER'
```

### JWT Payload

```typescript
type JwtPayload = {
  sub: string // user ID
  tenant_id: number | null
  role: string
  first_name: string
  last_name: string
  email: string
  company_id?: number
  exp: number
  iat: number
}
```

## API Pattern

### Dual API Strategy

- **GraphQL (Apollo)** for ALL reads — queries use `useQuery` from `@apollo/client/react`
- **REST (TanStack Query)** for ALL writes — mutations via `useMutation` from `@tanstack/react-query`
- **Exception**: Permits listing uses REST (`useQuery` from TanStack) — no GraphQL query exists

### HTTP Client

Custom `httpClient` wrapping `fetch`:

- Base URL: `VITE_API_URL` (default `http://localhost:8080/api`)
- Auto-attaches `Authorization: Bearer <token>` header
- Supports `X-Tenant-Id` header for multi-tenant requests
- Auto-refreshes token on 401/403 and retries the request
- Methods: `get`, `post`, `put`, `patch`, `delete`

### Apollo Client

- GraphQL endpoint: `http://localhost:8080/graphql`
- `fetchPolicy: 'cache-and-network'`
- `errorPolicy: 'all'` (partial data renders despite field errors)
- Error link: auto-toasts mutation errors, dispatches `auth:logout` on UNAUTHORIZED

### Cache Invalidation

After REST mutation success:

```typescript
apolloClient.refetchQueries({ include: ['GetVehicles'] })
// For permits: also queryClient.invalidateQueries({ queryKey: ['permits'] })
```

## Data Models (GraphQL Schema Types)

### Vehicle

```typescript
{
  id, regNumber, make, model, year, vin,
  vehicleType: 'TRUCK' | 'TRACTOR' | 'TRAILER' | 'SEMI_TRAILER',
  fuelType: 'DIESEL' | 'PETROL' | 'LPG' | 'CNG' | 'ELECTRIC',
  ownership: 'OWNED' | 'LEASED' | 'RENTED',
  status: 'ACTIVE' | 'IN_SERVICE' | 'INACTIVE',
  cargoCapacityKg, cargoVolumeM3, avgConsumptionL100km, odometerKm,
  currentDriverId, currentDriverName,
  documents: [{ id, documentType, originalFilename, expirationDate, notes }]
}
```

### Driver

```typescript
{
  id, firstName, lastName, jmbg, phone, email, birthDate,
  licenseNumber, licenseCategories,
  adrCertificate, adrExpiry, healthCheckExpiry, employmentDate,
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE',
  companyId, vehicleId, vehicleRegNumber,
  documents: [{ id, documentType, originalFilename, expirationDate, notes }]
}
```

### Route (Transport Order)

```typescript
{
  id, internalNumber,
  routeType: 'DOMESTIC' | 'INTERNATIONAL',
  status: 'CREATED' | 'DISPATCHED' | 'IN_TRANSIT' | 'COMPLETED' | 'INVOICED' | 'PAID' | 'CANCELLED',
  partnerId, vehicleId, driverId, trailerId,
  departureDate, returnDate,
  cargoDescription, cargoWeightKg, cargoVolumeM3,
  price, currency, distanceKm, totalExpenseRsd, profit, notes,
  partner: { id, name, pib, city },
  vehicle: { id, regNumber, make, model },
  driver: { id, firstName, lastName, phone },
  stops: [{ id, stopOrder, stopType, address, city, countryCode, zipCode, plannedArrival/Departure, actualArrival/Departure, notes }],
  expenses: [{ id, category, amount, currency, exchangeRate, amountRsd, description, expenseDate, status }]
}
```

### Stop Types

```typescript
;'LOADING' | 'UNLOADING' | 'BORDER' | 'CUSTOMS' | 'REST' | 'FUEL' | 'OTHER'
```

### Expense Categories

```typescript
;'FUEL' |
  'TOLL_DOMESTIC' |
  'TOLL_INTERNATIONAL' |
  'PER_DIEM' |
  'PARKING' |
  'VIGNETTE' |
  'CUSTOMS' |
  'BORDER_FEE' |
  'FERRY' |
  'MAINTENANCE' |
  'WASH' |
  'PHONE' |
  'FINE' |
  'OTHER'
```

### Partner

```typescript
{
  id, name, pib (tax ID), maticniBroj (registration number),
  address, city, country, zipCode, bankAccount,
  partnerType: 'CLIENT' | 'SUPPLIER' | 'BOTH',
  phone, email, contactPerson, notes
}
```

### Invoice

```typescript
{
  id, invoiceNumber, partnerId, invoiceDate, dueDate,
  currency, subtotal, vatRate, vatAmount, total,
  paymentStatus: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED',
  relatedRouteIds, notes,
  partner: { id, name, pib, city, address },
  items: [{ id, description, quantity, unit, unitPrice, total }]
}
```

### Permit

```typescript
{
  id, permitNumber, permitType: 'CEMT' | 'BILATERAL' | 'TRANSIT' | 'ECMT',
  countryCode, countryName, validFrom, validTo,
  status: 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED',
  assignedVehicleId, assignedVehicleRegNumber, notes
}
```

### Fuel Tank

```typescript
{
  ;(id,
    name,
    capacityLiters,
    currentLevelLiters,
    fuelType,
    location,
    percentFull)
}
```

### Trailer

```typescript
{
  id, regNumber,
  type: 'CURTAIN' | 'BOX' | 'REFRIGERATED' | 'FLATBED' | 'TANK' | 'CONTAINER',
  lengthM, capacityKg, year,
  ownership: 'OWNED' | 'LEASED' | 'RENTED',
  status: 'ACTIVE' | 'IN_SERVICE' | 'INACTIVE'
}
```

### Tenant

```typescript
{
  ;(id, subdomain, name, active, createdAt, updatedAt)
}
```

### Dashboard

```typescript
{
  activeRoutesCount, completedRoutesThisMonth,
  monthlyExpenseTotal, monthlyRevenueTotal, profitThisMonth,
  expensesByCategory: [{ category, totalAmountRsd }],
  expenseTrendMonthly: [{ month, totalAmountRsd }],
  topVehiclesByExpense: [{ vehicleId, regNumber, totalAmountRsd }],
  expiringPermits: [{ id, permitType, permitNumber, countryName, validTo, daysUntilExpiry }],
  expiringDocuments: [{ entityType, entityId, entityName, documentType, expirationDate, daysUntilExpiry }],
  overdueInvoices: [{ id, invoiceNumber, partnerName, total, currency, daysOverdue }],
  recentRoutes: [{ id, internalNumber, status, partnerName, departureDate, price, currency }],
  recentNotifications: [{ id, title, message, read, createdAt }],
  fleetSummary: { totalVehicles, activeVehicles, totalDrivers, activeDrivers }
}
```

## Statistics / Analytics Queries (GraphQL)

All analytics queries require `from` and `to` date parameters:

- `costPerKm` → `[{ vehicleId, regNumber, totalExpenseRsd, totalDistanceKm, costPerKmRsd }]`
- `fuelConsumptionTrend(vehicleId)` → `[{ vehicleId, regNumber, month, avgLitersPer100km }]`
- `fuelConsumptionAllVehicles` → same shape, all vehicles
- `driverFuelComparison` → `[{ driverId, driverName, avgLitersPer100km, totalKm, totalLiters }]`
- `vehicleUtilization` → `[{ vehicleId, regNumber, daysInPeriod, daysOnRoad, utilizationPercent }]`
- `driverProductivity` → `[{ driverId, driverName, routeCount, totalRevenue, totalProfit, daysOnRoad }]`
- `monthlyPnl` → `[{ month, revenue, expenses, profit }]`
- `profitabilityByRoute` → paginated `[{ routeId, internalNumber, partnerName, vehicleRegNumber, revenue, expenses, profit, marginPercent }]`
- `profitabilityByVehicle` → `[{ vehicleId, regNumber, routeCount, totalRevenue, totalExpenses, profit, avgProfitPerRoute }]`
- `profitabilityByPartner` → `[{ partnerId, partnerName, routeCount, totalRevenue, totalExpenses, profit }]`
- `topProfitableRoutes(limit)` → `[{ routeId, internalNumber, partnerName, vehicleRegNumber, revenue, expenses, profit, marginPercent }]`
- `agingAnalysis` → `[{ bucket, invoiceCount, totalAmount, currency }]`
- `topDebtors(limit)` → `[{ partnerId, partnerName, totalDebt, invoiceCount, oldestDueDate, avgDaysOverdue }]`
- `routeCountByPartner` → `[{ partnerId, partnerName, routeCount, totalRevenue }]`
- `invoiceCollectionStats` → `{ totalInvoiced, totalCollected, totalOverdue, collectionRate, avgCollectionDays, overdueCount }`
- `expenseSummary(groupBy)` → `[{ key, totalAmountRsd }]`

## REST Endpoints

All prefixed with `/api`:

### Auth

- `POST /auth/login` — `{ email, password }` → `{ accessToken, refreshToken, tokenType, expiresIn, role, firstName, lastName }`
- `POST /auth/refresh` — `{ refreshToken }` → `{ accessToken, refreshToken, tokenType, expiresIn }`

### CRUD (all require Bearer token)

- **Vehicles**: `POST/PUT/DELETE /vehicles/{id}`
- **Drivers**: `POST/PUT/DELETE /drivers/{id}`
- **Trailers**: `POST/PUT/DELETE /trailers/{id}`
- **Partners**: `POST/PUT/DELETE /partners/{id}`
- **Routes**: `POST/PUT/DELETE /routes/{id}`, `PATCH /routes/{id}/status`
- **Expenses**: `POST/PUT/DELETE /expenses/{id}` (always nested under a route)
- **Invoices**: `POST/PUT/DELETE /invoices/{id}`, `PATCH /invoices/{id}/status`
- **Fuel Tanks**: `POST/PUT/DELETE /fuel-tanks/{id}`
- **Fuel Transactions**: `POST /fuel-tanks/transactions`
- **Permits**: `GET/POST/PUT/DELETE /permits/{id}`, `PATCH /permits/{id}/assign`
- **Documents**: `POST /vehicles/{id}/documents`, `POST /drivers/{id}/documents` (multipart upload)
- **Reports**: `GET /reports/routes?format=pdf|xlsx`, `GET /reports/expenses?format=pdf|xlsx`
- **Tenants**: `GET/POST/PUT /tenants/{id}` (SUPER_ADMIN only, uses `X-Tenant-Id` header)

### Rate Limiting

- Auth: 10/min
- Write: 60/min
- Read: 300/min

## Form Validation (Zod Schemas)

All forms use React Hook Form + Zod schema in `schemas.ts` files with `zodResolver`:

### Vehicle Schema

```typescript
vehicleSchema = z.object({
  regNumber: z.string().min(1),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.coerce.number().min(1900).max(2100).optional().nullable(),
  vin: z.string().optional().nullable(),
  vehicleType: z.enum(['TRUCK', 'TRACTOR', 'TRAILER', 'SEMI_TRAILER']),
  fuelType: z.enum(['DIESEL', 'PETROL', 'LPG', 'CNG', 'ELECTRIC']),
  ownership: z.enum(['OWNED', 'LEASED', 'RENTED']).optional().nullable(),
  cargoCapacityKg: z.coerce.number().positive().optional().nullable(),
  cargoVolumeM3: z.coerce.number().positive().optional().nullable(),
  avgConsumptionL100km: z.coerce.number().positive().optional().nullable(),
  odometerKm: z.coerce.number().min(0).optional().nullable(),
  currentDriverId: z.coerce.number().positive().optional().nullable(),
})
```

### Driver Schema

```typescript
driverSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  jmbg: z
    .string()
    .regex(/^(\d{13})?$/)
    .optional()
    .or(z.literal(''))
    .nullable(),
  phone,
  email,
  birthDate,
  licenseNumber,
  licenseCategories,
  adrCertificate: z.boolean().optional().nullable(),
  adrExpiry,
  healthCheckExpiry,
  employmentDate,
  vehicleId: z.coerce.number().positive().optional().nullable(),
})
```

### Route Schema

Route form includes nested `stops` array with stop order, type, address, city, countryCode, times.

### Expense Schema

```typescript
{
  ;(routeId,
    category,
    amount,
    currency,
    exchangeRate,
    amountRsd,
    description,
    expenseDate)
}
```

## UI Conventions

1. All text through `t()` — never hardcoded strings
2. Serbian is default language (`lng: 'sr'`)
3. Tables: TanStack Table with `manualPagination` + `manualSorting`, server-side
4. Dates: `formatDate()` → `dd.MM.yyyy` with Serbian locale
5. Currency: `formatCurrency()` → `sr-RS` locale via `Intl.NumberFormat`
6. Validation: PIB mod11 checksum, JMBG regex (13 digits)
7. Icons: Lucide React only
8. Empty states: inside table body (Inbox icon + text + action button)
9. Forms in Sheets (drawers): save button in `SheetHeader` `actions` prop
10. Forms in Dialogs (modals): save button in `DialogFooter`
11. Detail sheets: every entity table gets a detail drawer on row click + edit button
12. Edit forms fetch full detail data (not just list fields) to populate all fields
13. Charts (Recharts): custom `content` tooltips with `bg-popover` for dark mode, `cursor={false}`
14. Row highlight: `useHighlightRow()` hook — highlights row on dashboard navigation or after closing detail drawer
15. Zod resolver: cast as `any` due to Zod 4 type inference issue

## Sidebar Navigation Groups

```
Operations: Dashboard, Routes (Nalozi), Expenses (Troškovi)
Fleet: Vehicles (Vozila), Drivers (Vozači), Trailers (Prikolice)
Finance: Partners (Partneri), Fuel (Gorivo), Invoices (Fakture), Exchange Rates (Kursna lista), Permits (Dozvole)
Analytics: Reports (Izveštaji), Statistics (Statistika)
```

Sidebar has collapsible groups with popover navigation when collapsed.

## i18n Namespaces (12 each for sr/en)

`auth`, `common`, `dashboard`, `finance`, `fleet`, `fuel`, `navigation`, `partners`, `permits`, `reports`, `spedition`, `tenants`

## Key Shared Components

- **DataTable** — reusable table with pagination, sorting, skeleton loading, row highlighting, empty state
- **PageHeader** — title + optional action slot
- **SearchInput** — debounced search with clear button
- **Sheet/Dialog** — overlay components (sheets for detail drawers, dialogs for modals)
- **Select** — searchable, clearable, creatable select component
- **DatePicker/DateTimePicker** — date selection with calendar
- **ExpandableChartCard** — chart container that can expand to full width
- **LoadingSkeleton** — loading placeholder
- **ConfirmDialog** — delete confirmation dialog
- **UnsavedChangesDialog** — warns when leaving form with unsaved changes

## Key Shared Hooks

- `useDebounce(value, delay)` — debounces a value
- `useTableSort(defaultSort)` — manages TanStack Table sorting state, extracts `sortBy`/`sortDir`
- `useHighlightRow()` — highlights a table row from navigation state or after drawer close
- `usePageTitle(title)` — sets document title
- `useFilterVisibility()` — toggles filter row visibility
- `useUnsavedChanges(isDirty)` — blocks navigation when form is dirty
- `useMobile()` — responsive breakpoint detection

## Key Shared Utilities

- `cn(...classes)` — clsx + tailwind-merge
- `formatDate(date)` — `dd.MM.yyyy` with Serbian locale
- `formatCurrency(amount, currency?)` — `sr-RS` Intl.NumberFormat
- `extractApiError(error)` — extracts message + field errors from API responses
- `downloadFile(url, filename)` — file download with auth token
- `isValidPib(pib)` — PIB mod11 checksum validation
- `isValidEmail(email)` — email regex validation
- `AUTH_STORAGE_KEY` — localStorage key for auth data

## Environment

```
VITE_PORT=7445
VITE_API_URL=http://localhost:8080/api
```

## Known BE Bugs (flagged to colleague)

- `POST /api/fuel-tanks/transactions` returns 500
- `GET /api/exchange-rates/convert` returns `convertedAmount: null` (NBS rates not loaded)
- `dashboard { expiringDocuments }` returns wrong `entityId` (returns doc ID, not entity ID)
- Search (drivers, vehicles, partners) doesn't support substring matching with Serbian diacritics
- `PUT /api/vehicles/{id}` ignores `currentDriverId`
- `expenseSummary` returns empty despite routes having expenses

## Backend Info

- **Spring Boot** (Java), PostgreSQL database
- **GraphQL endpoint**: `/graphql`
- **REST base**: `/api`
- **Multi-tenant**: supports multiple companies via `X-Tenant-Id` header
- **Docker**: `docker compose up -d --build` to start
- **GraphQL schema location**: `src/main/resources/graphql/schema.graphqls`
- After BE changes, regenerate FE types: `npx graphql-codegen`
