import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import type { PartnerFilter, Partner } from '../types'

export const GET_PARTNERS = gql`
  query GetPartners($search: String, $partnerType: String, $page: Int, $size: Int) {
    partners(search: $search, partnerType: $partnerType, page: $page, size: $size) {
      content {
        id
        name
        pib
        city
        partnerType
        phone
        email
        contactPerson
        createdAt
      }
      totalElements
      totalPages
      number
      size
    }
  }
`

type PartnersPage = {
  content: Partner[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export function usePartners(filter: PartnerFilter) {
  return useQuery<{ partners: PartnersPage }>(GET_PARTNERS, {
    variables: filter,
  })
}
