import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import type { DriverFilter, Driver } from '../types'

export const GET_DRIVERS = gql`
  query GetDrivers($status: String, $companyId: ID, $search: String, $page: Int, $size: Int) {
    drivers(status: $status, companyId: $companyId, search: $search, page: $page, size: $size) {
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
        createdAt
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
        createdAt
      }
      createdAt
      updatedAt
    }
  }
`

type DriversPage = {
  content: Driver[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export function useDrivers(filter: DriverFilter) {
  return useQuery<{ drivers: DriversPage }>(GET_DRIVERS, {
    variables: filter,
  })
}

export function useDriver(id: number | null) {
  return useQuery<{ driver: Driver | null }>(GET_DRIVER, {
    variables: { id: String(id) },
    skip: !id,
  })
}
