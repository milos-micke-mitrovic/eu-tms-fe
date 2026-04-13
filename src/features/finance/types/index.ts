// ── Re-export generated types as single source of truth ─────
export type {
  ExchangeRate,
  PerDiemRate,
  Invoice,
  InvoiceItem,
  InvoicePage,
} from '@/generated/graphql'

// ── Union literal types ─────────────────────────────────────
export type InvoiceStatus =
  | 'UNPAID'
  | 'PARTIAL'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED'

// ── REST-only types ─────────────────────────────────────────
export type PerDiemCalculationRequest = {
  routeId: number
  countries?: { countryCode: string; days: number }[]
}

export type PerDiemLineItem = {
  countryCode: string
  countryNameSr: string
  hours: number
  days: number
  dailyAmount: number
  currency: string
  totalAmount: number
  totalAmountRsd: number
}

export type PerDiemCalculationResponse = {
  lineItems: PerDiemLineItem[]
  totalRsd: number
}

export type InvoiceRequest = {
  partnerId: number
  issueDate: string
  dueDate: string
  currency: string
  notes?: string
  items: {
    description: string
    quantity: number
    unitPrice: number
  }[]
}

export type InvoiceFilter = {
  status?: string
  partnerId?: number
  dateFrom?: string
  dateTo?: string
  search?: string
  sortBy?: string
  sortDir?: string
  page?: number
  size?: number
}
