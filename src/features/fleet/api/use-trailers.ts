import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import type { Trailer } from '../types'

export const GET_TRAILERS = gql`
  query GetTrailers($page: Int, $size: Int) {
    trailers(page: $page, size: $size) {
      content {
        id
        regNumber
        type
        lengthM
        capacityKg
        year
        ownership
        status
        createdAt
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

export function useTrailers(page: number = 0, size: number = 20) {
  return useQuery<{ trailers: TrailersPage }>(GET_TRAILERS, {
    variables: { page, size },
  })
}
