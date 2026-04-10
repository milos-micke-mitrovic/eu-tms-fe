import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import type { GetDriversQuery, GetDriverQuery } from '@/generated/graphql'
import type { DriverFilter } from '../types'

export const GET_DRIVERS = gql`
  query GetDrivers(
    $status: String
    $companyId: ID
    $search: String
    $sortBy: String
    $sortDir: String
    $page: Int
    $size: Int
  ) {
    drivers(
      status: $status
      companyId: $companyId
      search: $search
      sortBy: $sortBy
      sortDir: $sortDir
      page: $page
      size: $size
    ) {
      content {
        id
        firstName
        lastName
        jmbg
        phone
        licenseCategories
        status
        vehicleId
        vehicleRegNumber
      }
      totalElements
      totalPages
      number
      size
    }
  }
`

export const GET_DRIVER = gql`
  query GetDriver($id: ID!) {
    driver(id: $id) {
      id
      firstName
      lastName
      jmbg
      phone
      email
      birthDate
      licenseNumber
      licenseCategories
      adrCertificate
      adrExpiry
      healthCheckExpiry
      employmentDate
      status
      companyId
      vehicleId
      vehicleRegNumber
      documents {
        id
        documentType
        originalFilename
        expirationDate
        notes
      }
    }
  }
`

export function useDrivers(filter: DriverFilter) {
  return useQuery<GetDriversQuery>(GET_DRIVERS, {
    variables: filter,
  })
}

export function useDriver(id: string | null) {
  return useQuery<GetDriverQuery>(GET_DRIVER, {
    variables: { id },
    skip: !id,
  })
}
