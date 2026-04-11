import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

// Types
export type RouteProfitability = {
  routeId: number
  internalNumber: string
  partnerName: string
  vehicleRegNumber: string
  revenue: number
  expenses: number
  profit: number
  marginPercent: number
}

export type VehicleProfitability = {
  vehicleId: number
  regNumber: string
  routeCount: number
  totalRevenue: number
  totalExpenses: number
  profit: number
  avgProfitPerRoute: number
}

export type PartnerProfitability = {
  partnerId: number
  partnerName: string
  routeCount: number
  totalRevenue: number
  totalExpenses: number
  profit: number
}

export type CollectionStats = {
  totalInvoiced: number
  totalCollected: number
  totalOverdue: number
  collectionRate: number
  avgCollectionDays: number
  overdueCount: number
}

// Queries
const PROFITABILITY_BY_ROUTE = gql`
  query ProfitabilityByRoute($from: Date!, $to: Date!, $page: Int, $size: Int) {
    profitabilityByRoute(from: $from, to: $to, page: $page, size: $size) {
      content {
        routeId
        internalNumber
        partnerName
        vehicleRegNumber
        revenue
        expenses
        profit
        marginPercent
      }
      totalPages
      totalElements
    }
  }
`

const PROFITABILITY_BY_VEHICLE = gql`
  query ProfitabilityByVehicle($from: Date!, $to: Date!) {
    profitabilityByVehicle(from: $from, to: $to) {
      vehicleId
      regNumber
      routeCount
      totalRevenue
      totalExpenses
      profit
      avgProfitPerRoute
    }
  }
`

const PROFITABILITY_BY_PARTNER = gql`
  query ProfitabilityByPartner($from: Date!, $to: Date!) {
    profitabilityByPartner(from: $from, to: $to) {
      partnerId
      partnerName
      routeCount
      totalRevenue
      totalExpenses
      profit
    }
  }
`

const INVOICE_COLLECTION_STATS = gql`
  query InvoiceCollectionStats($from: Date!, $to: Date!) {
    invoiceCollectionStats(from: $from, to: $to) {
      totalInvoiced
      totalCollected
      totalOverdue
      collectionRate
      avgCollectionDays
      overdueCount
    }
  }
`

// Hooks
export function useProfitabilityByRoute(
  from: string,
  to: string,
  page = 0,
  size = 20
) {
  return useQuery<{
    profitabilityByRoute: {
      content: RouteProfitability[]
      totalPages: number
      totalElements: number
    }
  }>(PROFITABILITY_BY_ROUTE, { variables: { from, to, page, size } })
}

export function useProfitabilityByVehicle(from: string, to: string) {
  return useQuery<{
    profitabilityByVehicle: VehicleProfitability[]
  }>(PROFITABILITY_BY_VEHICLE, { variables: { from, to } })
}

export function useProfitabilityByPartner(from: string, to: string) {
  return useQuery<{
    profitabilityByPartner: PartnerProfitability[]
  }>(PROFITABILITY_BY_PARTNER, { variables: { from, to } })
}

export function useInvoiceCollectionStats(from: string, to: string) {
  return useQuery<{
    invoiceCollectionStats: CollectionStats
  }>(INVOICE_COLLECTION_STATS, { variables: { from, to } })
}
