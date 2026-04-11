import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import type { GetPartnersQuery } from '@/generated/graphql'
import type { PartnerFilter } from '../types'

export const GET_PARTNERS = gql`
  query GetPartners(
    $search: String
    $partnerType: String
    $sortBy: String
    $sortDir: String
    $page: Int
    $size: Int
  ) {
    partners(
      search: $search
      partnerType: $partnerType
      sortBy: $sortBy
      sortDir: $sortDir
      page: $page
      size: $size
    ) {
      content {
        id
        name
        pib
        maticniBroj
        address
        city
        country
        zipCode
        bankAccount
        partnerType
        phone
        email
        contactPerson
        notes
      }
      totalElements
      totalPages
      number
      size
    }
  }
`

export function usePartners(filter: PartnerFilter) {
  return useQuery<GetPartnersQuery>(GET_PARTNERS, {
    variables: filter,
  })
}
