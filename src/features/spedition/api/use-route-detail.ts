import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import type { Route } from '../types'

export const GET_ROUTE = gql`
  query GetRoute($id: ID!) {
    route(id: $id) {
      id internalNumber routeType status
      partnerId partner { id name pib city }
      vehicleId vehicle { id regNumber make model }
      driverId driver { id firstName lastName phone }
      trailerId
      departureDate returnDate
      cargoDescription cargoWeightKg cargoVolumeM3
      price currency distanceKm notes
      stops { id stopOrder stopType address city countryCode zipCode plannedArrival actualArrival plannedDeparture actualDeparture notes }
      expenses { id category amount currency exchangeRate amountRsd description expenseDate status }
      totalExpenseRsd profit
     
    }
  }
`

export function useRouteDetail(id: number | null) {
  return useQuery<{ route: Route | null }>(GET_ROUTE, {
    variables: { id: String(id) },
    skip: !id,
  })
}
