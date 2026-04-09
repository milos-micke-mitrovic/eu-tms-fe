import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import type { VehicleFilter, Vehicle } from '../types'

export const GET_VEHICLES = gql`
  query GetVehicles($status: String, $vehicleType: String, $search: String, $page: Int, $size: Int) {
    vehicles(status: $status, vehicleType: $vehicleType, search: $search, page: $page, size: $size) {
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
        createdAt
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
        createdAt
      }
      createdAt
      updatedAt
    }
  }
`

type VehiclesPage = {
  content: Vehicle[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export function useVehicles(filter: VehicleFilter) {
  return useQuery<{ vehicles: VehiclesPage }>(GET_VEHICLES, {
    variables: filter,
  })
}

export function useVehicle(id: number | null) {
  return useQuery<{ vehicle: Vehicle | null }>(GET_VEHICLE, {
    variables: { id: String(id) },
    skip: !id,
  })
}
