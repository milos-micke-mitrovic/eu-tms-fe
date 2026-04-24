# CLAUDE.md — EU TMS Frontend

## Project

Frontend dashboard for European TMS (Transport Management System) targeting Serbian spedition companies. Desktop-first (min 1024px), responsive.

Backend: Spring Boot at `../../Truck-eu/` (separate repo), runs on port 8080.

## Tech Stack

- React 19, TypeScript (strict), Vite 7, Tailwind CSS 4
- shadcn/ui (New York style), Lucide icons
- Apollo Client 4 (GraphQL reads), TanStack Query 5 (REST mutations + permits listing)
- TanStack Table 8 with server-side pagination + sorting
- React Hook Form 7 + Zod 4
- Recharts 2 (charts), Leaflet (maps)
- react-i18next (Serbian default, English fallback)
- Vitest (unit + integration tests)
- pnpm (package manager — never use npm)
- GraphQL Codegen (generates types from BE schema)

## Commands

```
pnpm dev            # Dev server on port 7445 (user runs this, never Claude)
pnpm build          # Type check (tsc -b) + production build (vite build)
pnpm test:unit      # Unit tests (200+, no BE needed)
pnpm test:api       # Integration tests (73+, needs BE on localhost:8080)
pnpm test:all       # All tests combined
npx graphql-codegen # Regenerate types from BE schema → src/generated/graphql.ts
```

## Backend Access

- BE repo: `../../Truck-eu/` — can `git pull` to get latest changes
- Start BE: `cd ../../Truck-eu && docker compose up -d --build`
- BE has rate limiting: auth 10/min, write 60/min, read 300/min — test helpers retry on 429
- GraphQL schema: `../../Truck-eu/src/main/resources/graphql/schema.graphqls`
- After pulling BE, always run `npx graphql-codegen` to update FE generated types
- When FE catches BE bugs (wrong field names, 500s, missing endpoints), flag to user for BE colleague

## Architecture

```
src/
├── app/            # Layout, providers, routes
├── features/       # Feature modules
│   ├── auth/       # Login, JWT, token refresh
│   ├── dashboard/  # KPI cards, charts, alerts panel, fleet summary
│   ├── documents/  # CMR, travel orders (sub-feature of spedition)
│   ├── finance/    # Invoices, exchange rates
│   ├── fleet/      # Vehicles, drivers, trailers + documents
│   ├── fuel/       # Fuel tanks, transactions
│   ├── notifications/ # Bell popover in header
│   ├── partners/   # Clients, suppliers
│   ├── permits/    # Transport permits (CEMT, bilateral)
│   ├── reports/    # PDF/Excel downloads + statistics/profitability charts
│   └── spedition/  # Routes, expenses, stops
│   └── {feature}/
│       ├── api/        # GraphQL queries (Apollo) + REST mutations (TanStack)
│       ├── components/ # Tables, forms, detail sheets
│       ├── constants/  # Enums, category maps
│       ├── pages/      # Page components
│       ├── types/      # TypeScript types matching BE DTOs
│       └── schemas.ts  # Zod validation schemas (shared by forms + tests)
├── generated/      # GraphQL codegen output (single source of truth for GQL types)
├── shared/         # Reusable across features
│   ├── api/        # httpClient (fetch), apolloClient
│   ├── components/ # PageHeader, SearchInput, ThemeToggle, LanguageSwitcher, etc.
│   ├── hooks/      # useDebounce, usePageTitle, useTableSort, useHighlightRow, etc.
│   ├── types/      # PageResponse, PageParams
│   ├── ui/         # shadcn/ui components (data-table, overlay/sheet, overlay/dialog, etc.)
│   └── utils/      # cn, formatDate, formatCurrency, validation (PIB/JMBG mod11), downloadFile
├── i18n/           # Translations (sr + en, 11 namespaces)
├── styles/         # CSS variables (brand, colors with .dark, layout)
└── test/           # Test setup + API integration tests
```

## API Pattern

- **GraphQL (Apollo)** for all reads — lists, details, dashboard, statistics
- **REST (TanStack Query)** for all writes — create, update, delete, upload
- **Exception**: Permits listing uses REST (TanStack useQuery) — no GraphQL query exists in BE
- After every REST mutation: `apolloClient.refetchQueries({ include: ['QueryName'] })`
- For permits mutations: also `queryClient.invalidateQueries({ queryKey: ['permits'] })`
- Apollo `errorPolicy: 'all'` — partial data renders despite field errors
- Mutation errors auto-toast via global QueryClient `onError`

## Conventions

1. All text through `t()` — never hardcoded strings (exception: "Status" which is same in both languages)
2. Serbian is default language (`lng: 'sr'`)
3. Forms: React Hook Form + Zod schema in `schemas.ts`, zodResolver
4. Tables: TanStack Table with `manualPagination` + `manualSorting`, server-side
5. Dates: `formatDate()` with Serbian locale, format `dd.MM.yyyy`
6. Currency: `formatCurrency()` with `sr-RS` locale via `Intl.NumberFormat`
7. Validation: PIB mod11, JMBG regex (13 digits only, mod11 removed)
8. Icons: Lucide React only
9. Empty states: inside table body (Inbox icon + text + action button)
10. Forms in Sheets (drawers): save button in SheetHeader `actions` prop — always accessible without scrolling
11. Forms in Dialogs (modals): save button in DialogFooter at bottom — modals are small, no scroll needed
12. Apollo v4 imports: `useQuery` from `@apollo/client/react`, `gql` from `@apollo/client`
13. Zod resolver: cast as `any` due to Zod 4 type inference issue (`// eslint-disable-next-line`)
14. Detail sheets: every entity with a table gets a detail drawer on row click + edit button in header
15. Edit forms fetch full detail data (not just list item fields) to populate all fields
16. Charts (Recharts): use custom `content` tooltips with `bg-popover` for dark mode, always set `cursor={false}`
17. Row highlight: `useHighlightRow()` hook — highlights row on dashboard navigation or after closing detail drawer

## Sidebar Navigation (13 items)

Dashboard, Nalozi, Troškovi, Vozila, Vozači, Prikolice, Partneri, Gorivo, Fakture, Kursna lista, Dozvole, Izveštaji, Statistika

## Environment

```
VITE_PORT=7445
VITE_API_URL=http://localhost:8080/api
```

httpClient prepends `VITE_API_URL` — endpoints are `/vehicles`, `/auth/login` (without `/api` prefix).

## Known BE Bugs (flagged to colleague)

- `POST /api/fuel-tanks/transactions` returns 500
- `GET /api/exchange-rates/convert` returns `convertedAmount: null` (NBS rates not loaded)
- `dashboard { expiringDocuments }` returns wrong `entityId` (returns doc ID, not entity ID)
- Search (`drivers`, `vehicles`, `partners`) doesn't support substring matching with Serbian diacritics
- `PUT /api/vehicles/{id}` ignores `currentDriverId`
- `expenseSummary` returns empty despite routes having expenses
