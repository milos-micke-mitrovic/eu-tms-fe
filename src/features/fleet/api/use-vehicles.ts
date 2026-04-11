import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import type { GetVehiclesQuery, GetVehicleQuery } from '@/generated/graphql'
import type { VehicleFilter } from '../types'

export const GET_VEHICLES = gql`
  query GetVehicles(
    $status: String
    $vehicleType: String
    $search: String
    $sortBy: String
    $sortDir: String
    $page: Int
    $size: Int
  ) {
    vehicles(
      status: $status
      vehicleType: $vehicleType
      search: $search
      sortBy: $sortBy
      sortDir: $sortDir
      page: $page
      size: $size
    ) {
      content {
        id
        regNumber
        make
        model
        year
        vehicleType
        fuelType
        ownership
        status
        currentDriverId
        currentDriverName
        odometerKm
      }
      totalElements
      totalPages
      number
      size
    }
  }
`

export const GET_VEHICLE = gql`
  query GetVehicle($id: ID!) {
    vehicle(id: $id) {
      id
      regNumber
      make
      model
      year
      vin
      vehicleType
      fuelType
      ownership
      status
      cargoCapacityKg
      cargoVolumeM3
      avgConsumptionL100km
      odometerKm
      currentDriverId
      currentDriverName
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

export function useVehicles(filter: VehicleFilter) {
  return useQuery<GetVehiclesQuery>(GET_VEHICLES, {
    variables: filter,
  })
}

export function useVehicle(id: string | null) {
  return useQuery<GetVehicleQuery>(GET_VEHICLE, {
    variables: { id: id ?? '' },
    skip: !id,
  })
}
