// ── Re-export generated types as single source of truth ─────
export type {
  TachographEntry,
  TachographViolation,
  TachographWeeklySummary,
  TachographDriverStatus,
  TachographMonthlySummary,
  TachographCompliance,
  TachographTopViolator,
} from '@/generated/graphql'

// ── REST-only types (not in GraphQL schema) ─────────────────
export type TachographEntryRequest = {
  driverId: number
  entryDate: string
  drivingMinutes: number
  restMinutes: number
  otherWorkMinutes: number
  availabilityMinutes: number
  startOdometerKm?: number
  endOdometerKm?: number
  notes?: string
}

// DDD file parsing (REST response)
export type DddDailySummary = {
  date: string
  drivingMinutes: number
  restMinutes: number
  otherWorkMinutes: number
  availabilityMinutes: number
  totalMinutes: number
  startOdometerKm: number | null
  endOdometerKm: number | null
}

export type DddParseResult = {
  cardNumber: string | null
  cardHolderName: string | null
  oldestDate: string
  newestDate: string
  totalDays: number
  dailySummaries: DddDailySummary[]
}

export type DddImportWarning = {
  date: string | null
  message: string
}

export type DddImportResult = {
  totalDaysInFile: number
  daysImported: number
  daysSkipped: number
  daysWithErrors: number
  cardNumber: string | null
  oldestDate: string
  newestDate: string
  importedEntries: import('@/generated/graphql').TachographEntry[]
  warnings: DddImportWarning[]
}
