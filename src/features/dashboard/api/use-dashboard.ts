import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

// PARTIAL: BE Sprint 5 — Dashboard query defined per CLAUDE.md, not yet implemented

export const GET_DASHBOARD = gql`
  query Dashboard {
    dashboard {
      activeRoutesCount
      monthlyExpenseTotal
      monthlyRevenueTotal
      expensesByCategory { category totalAmountRsd }
      expiringDocuments(days: 30) { entityType entityName documentType expirationDate daysUntilExpiry }
    }
  }
`

export type DashboardData = {
  activeRoutesCount: number
  monthlyExpenseTotal: number
  monthlyRevenueTotal: number
  expensesByCategory: { category: string; totalAmountRsd: number }[]
  expiringDocuments: {
    entityType: string
    entityName: string
    documentType: string
    expirationDate: string
    daysUntilExpiry: number
  }[]
}

export function useDashboard() {
  return useQuery<{ dashboard: DashboardData }>(GET_DASHBOARD, {
    // Skip for now — BE doesn't have this query yet
    // Remove skip when BE Sprint 5 is deployed
    skip: true,
  })
}
