import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import type { RouteFilter, Route } from '../types'

// PARTIAL: BE Sprint 3 — query defined per CLAUDE.md, not yet implemented in BE
export const GET_ROUTES = gql`
  query GetRoutes($status: String, $search: String, $page: Int, $size: Int) {
    routes(status: $status, search: $search, page: $page, size: $size) {
      content {
        id
        internalNumber
        routeType
        status
        partner { id name }
        vehicle { id regNumber }
        driver { id firstName lastName }
        departureDate
        returnDate
        price
        currency
        totalExpenseRsd
        profit
      }
      totalElements
      totalPages
      number
      size
    }
  }
`

export const GET_ROUTE = gql`
  query GetRoute($id: ID!) {
    route(id: $id) {
      id
      internalNumber
      routeType
      status
      partner { id name }
      vehicle { id regNumber }
      driver { id firstName lastName }
      departureDate
      returnDate
      cargoDescription
      cargoWeightKg
      cargoVolumeM3
      price
      currency
      distanceKm
      notes
      stops { id stopOrder stopType address city countryCode plannedArrival actualArrival }
      expenses { id category amount currency amountRsd description expenseDate status }
      totalExpenseRsd
      profit
    }
  }
`

type RoutesPage = {
  content: Route[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export function useRoutes(filter: RouteFilter) {
  return useQuery<{ routes: RoutesPage }>(GET_ROUTES, {
    variables: filter,
  })
}

export function useRoute(id: number | null) {
  return useQuery<{ route: Route | null }>(GET_ROUTE, {
    variables: { id: String(id) },
    skip: !id,
  })
}
