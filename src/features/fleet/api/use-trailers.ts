import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import type { Trailer } from '../types'

export const GET_TRAILERS = gql`
  query GetTrailers($sortBy: String, $sortDir: String, $page: Int, $size: Int) {
    trailers(sortBy: $sortBy, sortDir: $sortDir, page: $page, size: $size) {
      content {
        id
        regNumber
        type
        lengthM
        capacityKg
        year
        ownership
        status
      }
      totalElements
      totalPages
      number
      size
    }
  }
`

type TrailersPage = {
  content: Trailer[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export function useTrailers(variables: { sortBy?: string; sortDir?: string; page?: number; size?: number } = {}) {
  return useQuery<{ trailers: TrailersPage }>(GET_TRAILERS, {
    variables: { page: 0, size: 20, ...variables },
  })
}
