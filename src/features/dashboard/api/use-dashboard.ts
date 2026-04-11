import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

export const GET_DASHBOARD = gql`
  query Dashboard {
    dashboard {
      activeRoutesCount
      completedRoutesThisMonth
      monthlyExpenseTotal
      monthlyRevenueTotal
      profitThisMonth
      expensesByCategory {
        category
        totalAmountRsd
      }
      expenseTrendMonthly {
        month
        totalAmountRsd
      }
      topVehiclesByExpense {
        vehicleId
        regNumber
        totalAmountRsd
      }
      expiringPermits {
        id
        permitType
        permitNumber
        countryName
        validTo
        daysUntilExpiry
      }
      expiringDocuments {
        entityType
        entityId
        entityName
        documentType
        expirationDate
        daysUntilExpiry
      }
      overdueInvoices {
        id
        invoiceNumber
        partnerName
        total
        currency
        daysOverdue
      }
      recentRoutes {
        id
        internalNumber
        status
        partnerName
        departureDate
        price
        currency
      }
      recentNotifications {
        id
        title
        message
        read
        createdAt
      }
      fleetSummary {
        totalVehicles
        activeVehicles
        totalDrivers
        activeDrivers
      }
    }
  }
`

export type DashboardData = {
  activeRoutesCount: number
  completedRoutesThisMonth: number
  monthlyExpenseTotal: number
  monthlyRevenueTotal: number
  profitThisMonth: number
  expensesByCategory: {
    category: string
    totalAmountRsd: number
  }[]
  expenseTrendMonthly: {
    month: string
    totalAmountRsd: number
  }[]
  topVehiclesByExpense: {
    vehicleId: number
    regNumber: string
    totalAmountRsd: number
  }[]
  expiringPermits: {
    id: number
    permitType: string
    permitNumber: string
    countryName: string
    validTo: string
    daysUntilExpiry: number
  }[]
  expiringDocuments: {
    entityType: string
    entityId: number
    entityName: string
    documentType: string
    expirationDate: string
    daysUntilExpiry: number
  }[]
  overdueInvoices: {
    id: number
    invoiceNumber: string
    partnerName: string
    total: number
    currency: string
    daysOverdue: number
  }[]
  recentRoutes: {
    id: number
    internalNumber: string
    status: string
    partnerName: string
    departureDate: string
    price: number
    currency: string
  }[]
  recentNotifications: {
    id: number
    title: string
    message: string
    read: boolean
    createdAt: string
  }[]
  fleetSummary: {
    totalVehicles: number
    activeVehicles: number
    totalDrivers: number
    activeDrivers: number
  }
}

export function useDashboard() {
  return useQuery<{ dashboard: DashboardData }>(GET_DASHBOARD, {
    pollInterval: 60000,
  })
}
