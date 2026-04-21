import { gql } from '@apollo/client'

export const GET_COLLECTION_DASHBOARD = gql`
  query GetCollectionDashboard {
    collectionDashboard {
      totalReceivables
      totalOverdue
      collectedThisMonth
      collectionRate
      overdueInvoiceCount
      remindersThisMonth
      agingBuckets {
        bucket
        invoiceCount
        totalAmount
        currency
      }
    }
  }
`

export const GET_DEBTORS_SUMMARY = gql`
  query GetDebtorsSummary($limit: Int) {
    debtorsSummary(limit: $limit) {
      partnerId
      partnerName
      totalInvoices
      overdueInvoices
      totalDebt
      overdueDebt
      oldestDueDate
      avgDaysOverdue
      remindersSent
      lastReminderDate
    }
  }
`

export const GET_INVOICE_PAYMENTS = gql`
  query GetInvoicePayments($invoiceId: ID!) {
    invoicePayments(invoiceId: $invoiceId) {
      id
      invoiceId
      invoiceNumber
      paymentDate
      amount
      currency
      paymentMethod
      referenceNumber
      notes
      createdAt
    }
  }
`

export const GET_INVOICE_REMINDERS = gql`
  query GetInvoiceReminders($invoiceId: ID!) {
    invoiceReminders(invoiceId: $invoiceId) {
      id
      invoiceId
      invoiceNumber
      partnerName
      reminderType
      sentVia
      daysOverdue
      amountDue
      sentAt
    }
  }
`

export const GET_PARTNER_REMINDERS = gql`
  query GetPartnerReminders($partnerId: ID!) {
    partnerReminders(partnerId: $partnerId) {
      id
      invoiceId
      invoiceNumber
      partnerName
      reminderType
      sentVia
      daysOverdue
      amountDue
      sentAt
    }
  }
`
