import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import type {
  FuelConsumptionTrend,
  DriverFuelComparison,
  CostPerKm,
  VehicleUtilization,
  TopRoute,
  MonthlyPnl,
  AgingBucket,
  TopDebtor,
  RouteCountByPartner,
  DriverProductivity,
} from '../types'

// Queries
export const FUEL_CONSUMPTION_TREND = gql`
  query FuelConsumptionTrend($vehicleId: ID!, $from: Date!, $to: Date!) {
    fuelConsumptionTrend(vehicleId: $vehicleId, from: $from, to: $to) {
      vehicleId
      regNumber
      month
      avgLitersPer100km
    }
  }
`

export const FUEL_CONSUMPTION_ALL_VEHICLES = gql`
  query FuelConsumptionAllVehicles($from: Date!, $to: Date!) {
    fuelConsumptionAllVehicles(from: $from, to: $to) {
      vehicleId
      regNumber
      month
      avgLitersPer100km
    }
  }
`

export const DRIVER_FUEL_COMPARISON = gql`
  query DriverFuelComparison($from: Date!, $to: Date!) {
    driverFuelComparison(from: $from, to: $to) {
      driverId
      driverName
      avgLitersPer100km
      totalKm
      totalLiters
    }
  }
`

export const COST_PER_KM = gql`
  query CostPerKm($from: Date!, $to: Date!) {
    costPerKm(from: $from, to: $to) {
      vehicleId
      regNumber
      totalExpenseRsd
      totalDistanceKm
      costPerKmRsd
    }
  }
`

export const VEHICLE_UTILIZATION = gql`
  query VehicleUtilization($from: Date!, $to: Date!) {
    vehicleUtilization(from: $from, to: $to) {
      vehicleId
      regNumber
      daysInPeriod
      daysOnRoad
      utilizationPercent
    }
  }
`

export const TOP_PROFITABLE_ROUTES = gql`
  query TopProfitableRoutes($from: Date!, $to: Date!, $limit: Int) {
    topProfitableRoutes(from: $from, to: $to, limit: $limit) {
      routeId
      internalNumber
      partnerName
      vehicleRegNumber
      revenue
      expenses
      profit
      marginPercent
    }
  }
`

export const MONTHLY_PNL = gql`
  query MonthlyPnl($from: Date!, $to: Date!) {
    monthlyPnl(from: $from, to: $to) {
      month
      revenue
      expenses
      profit
    }
  }
`

export const AGING_ANALYSIS = gql`
  query AgingAnalysis {
    agingAnalysis {
      bucket
      invoiceCount
      totalAmount
      currency
    }
  }
`

export const TOP_DEBTORS = gql`
  query TopDebtors($limit: Int) {
    topDebtors(limit: $limit) {
      partnerId
      partnerName
      totalDebt
      invoiceCount
      oldestDueDate
      avgDaysOverdue
    }
  }
`

export const ROUTE_COUNT_BY_PARTNER = gql`
  query RouteCountByPartner($from: Date!, $to: Date!) {
    routeCountByPartner(from: $from, to: $to) {
      partnerId
      partnerName
      routeCount
      totalRevenue
    }
  }
`

export const DRIVER_PRODUCTIVITY = gql`
  query DriverProductivity($from: Date!, $to: Date!) {
    driverProductivity(from: $from, to: $to) {
      driverId
      driverName
      routeCount
      totalRevenue
      totalProfit
      daysOnRoad
    }
  }
`

// Hooks
export function useFuelConsumptionTrend(
  vehicleId: string,
  from: string,
  to: string
) {
  return useQuery<{
    fuelConsumptionTrend: FuelConsumptionTrend[]
  }>(FUEL_CONSUMPTION_TREND, { variables: { vehicleId, from, to } })
}

export function useFuelConsumptionAllVehicles(from: string, to: string) {
  return useQuery<{
    fuelConsumptionAllVehicles: FuelConsumptionTrend[]
  }>(FUEL_CONSUMPTION_ALL_VEHICLES, { variables: { from, to } })
}

export function useDriverFuelComparison(from: string, to: string) {
  return useQuery<{
    driverFuelComparison: DriverFuelComparison[]
  }>(DRIVER_FUEL_COMPARISON, { variables: { from, to } })
}

export function useCostPerKm(from: string, to: string) {
  return useQuery<{
    costPerKm: CostPerKm[]
  }>(COST_PER_KM, { variables: { from, to } })
}

export function useVehicleUtilization(from: string, to: string) {
  return useQuery<{
    vehicleUtilization: VehicleUtilization[]
  }>(VEHICLE_UTILIZATION, { variables: { from, to } })
}

export function useTopProfitableRoutes(
  from: string,
  to: string,
  limit?: number
) {
  return useQuery<{
    topProfitableRoutes: TopRoute[]
  }>(TOP_PROFITABLE_ROUTES, { variables: { from, to, limit } })
}

export function useMonthlyPnl(from: string, to: string) {
  return useQuery<{
    monthlyPnl: MonthlyPnl[]
  }>(MONTHLY_PNL, { variables: { from, to } })
}

export function useAgingAnalysis() {
  return useQuery<{
    agingAnalysis: AgingBucket[]
  }>(AGING_ANALYSIS)
}

export function useTopDebtors(limit?: number) {
  return useQuery<{
    topDebtors: TopDebtor[]
  }>(TOP_DEBTORS, { variables: { limit } })
}

export function useRouteCountByPartner(from: string, to: string) {
  return useQuery<{
    routeCountByPartner: RouteCountByPartner[]
  }>(ROUTE_COUNT_BY_PARTNER, { variables: { from, to } })
}

export function useDriverProductivity(from: string, to: string) {
  return useQuery<{
    driverProductivity: DriverProductivity[]
  }>(DRIVER_PRODUCTIVITY, { variables: { from, to } })
}
