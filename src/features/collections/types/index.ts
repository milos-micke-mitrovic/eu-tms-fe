// ── Re-export generated GraphQL types ─────
export type {
  InvoicePayment,
  CollectionReminder,
  PartnerDebtSummary,
  AgingBucket,
  CollectionDashboard,
} from '@/generated/graphql'

// ── REST-only types ───────────────────────

export type InvoicePaymentRequest = {
  invoiceId: number
  amount: number
  paymentDate: string
  paymentMethod: string
  currency: string
  referenceNumber?: string
  notes?: string
}

export type SendReminderRequest = {
  invoiceId: number
  reminderType: string
  sentVia: string
  recipientEmail?: string
  subject?: string
  messageBody?: string
}

export type CollectionRule = {
  id: number
  daysAfterDue: number
  reminderType: string
  sendVia: string
  enabled: boolean
  emailSubjectTemplate: string
  emailBodyTemplate: string
  createdAt: string
}

export type CollectionRuleRequest = {
  daysAfterDue: number
  reminderType: string
  sendVia: string
  enabled: boolean
  emailSubjectTemplate: string
  emailBodyTemplate: string
}
