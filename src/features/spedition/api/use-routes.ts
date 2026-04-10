import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import type { GetRoutesQuery } from '@/generated/graphql'
import type { RouteFilter } from '../types'

export const GET_ROUTES = gql`
  query GetRoutes(
    $status: String
    $routeType: String
    $partnerId: ID
    $search: String
    $sortBy: String
    $sortDir: String
    $page: Int
    $size: Int
  ) {
    routes(
      status: $status
      routeType: $routeType
      partnerId: $partnerId
      search: $search
      sortBy: $sortBy
      sortDir: $sortDir
      page: $page
      size: $size
    ) {
      content {
        id
        internalNumber
        routeType
        status
        partner {
          id
          name
        }
        vehicle {
          id
          regNumber
        }
        driver {
          id
          firstName
          lastName
        }
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

export function useRoutes(filter: RouteFilter) {
  return useQuery<GetRoutesQuery>(GET_ROUTES, { variables: filter })
}
