import { describe, it, expect } from 'vitest'
import { rest, graphql } from './helpers'
import { assertRestSuccess, assertGraphqlSuccess } from './assert-helpers'

describe('Vehicles API', () => {
  it('GraphQL — list vehicles with pagination', async () => {
    const res = await graphql(`
      {
        vehicles(page: 0, size: 5) {
          content {
            id
            regNumber
            make
            model
            status
          }
          totalElements
          totalPages
        }
      }
    `)
    assertGraphqlSuccess(res, 'vehicles list')
    expect(res.data.vehicles.content.length).toBeGreaterThan(0)
    expect(res.data.vehicles.totalElements).toBeGreaterThan(0)
    const v = res.data.vehicles.content[0]
    expect(v.id).toBeTruthy()
    expect(v.regNumber).toBeTruthy()
    expect(v.make).toBeTruthy()
  })

  it('GraphQL — list vehicles with sorting', async () => {
    const res = await graphql(`
      {
        vehicles(sortBy: "make", sortDir: "asc", page: 0, size: 5) {
          content {
            make
          }
        }
      }
    `)
    assertGraphqlSuccess(res, 'vehicles sorted')
    const makes = res.data.vehicles.content.map((v: { make: string }) => v.make)
    expect(makes).toEqual([...makes].sort())
  })

  it('GraphQL — single vehicle with documents', async () => {
    const listRes = await graphql(`
      {
        vehicles(page: 0, size: 1) {
          content {
            id
          }
        }
      }
    `)
    assertGraphqlSuccess(listRes, 'vehicles list for detail')
    const id = listRes.data.vehicles.content[0].id

    const res = await graphql(
      `
        query ($id: ID!) {
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
              expirationDate
            }
          }
        }
      `,
      { id }
    )
    assertGraphqlSuccess(res, 'vehicle detail')
    expect(res.data.vehicle).toBeTruthy()
    expect(res.data.vehicle.regNumber).toBeTruthy()
    expect(Array.isArray(res.data.vehicle.documents)).toBe(true)
  })

  it('REST — CRUD vehicle', async () => {
    // Create
    const createResult = await rest('POST', '/vehicles', {
      regNumber: `TV-${Date.now().toString(36)}`,
      make: 'Test',
      model: 'T1',
      vehicleType: 'TRUCK',
      fuelType: 'DIESEL',
    })
    assertRestSuccess(createResult, [201], 'create vehicle')
    expect(createResult.data.id).toBeTruthy()

    // Update
    const updateResult = await rest(
      'PUT',
      `/vehicles/${createResult.data.id}`,
      {
        regNumber: `TU-${Date.now().toString(36)}`,
        make: 'Test',
        model: 'T2',
        vehicleType: 'TRUCK',
        fuelType: 'DIESEL',
      }
    )
    assertRestSuccess(updateResult, [200], 'update vehicle')

    // Delete
    const deleteResult = await rest(
      'DELETE',
      `/vehicles/${createResult.data.id}`
    )
    assertRestSuccess(deleteResult, [204], 'delete vehicle')
  })
})

describe('Drivers API', () => {
  it('GraphQL — list drivers', async () => {
    const res = await graphql(`
      {
        drivers(page: 0, size: 5) {
          content {
            id
            firstName
            lastName
            status
          }
          totalElements
        }
      }
    `)
    assertGraphqlSuccess(res, 'drivers list')
    expect(res.data.drivers.content.length).toBeGreaterThan(0)
    expect(res.data.drivers.content[0].firstName).toBeTruthy()
  })

  it('REST — CRUD driver', async () => {
    const createResult = await rest('POST', '/drivers', {
      firstName: 'Test',
      lastName: 'Driver',
    })
    assertRestSuccess(createResult, [201], 'create driver')
    expect(createResult.data.id).toBeTruthy()

    const deleteResult = await rest(
      'DELETE',
      `/drivers/${createResult.data.id}`
    )
    assertRestSuccess(deleteResult, [204], 'delete driver')
  })
})

describe('Trailers API', () => {
  it('GraphQL — list trailers', async () => {
    const res = await graphql(`
      {
        trailers(page: 0, size: 5) {
          content {
            id
            regNumber
            type
            status
          }
          totalElements
        }
      }
    `)
    assertGraphqlSuccess(res, 'trailers list')
    expect(res.data.trailers.content.length).toBeGreaterThan(0)
  })

  it('REST — CRUD trailer', async () => {
    const createResult = await rest('POST', '/trailers', {
      regNumber: `TR-${Date.now().toString(36)}`,
      type: 'CURTAIN',
    })
    assertRestSuccess(createResult, [201], 'create trailer')
    expect(createResult.data.id).toBeTruthy()

    const deleteResult = await rest(
      'DELETE',
      `/trailers/${createResult.data.id}`
    )
    assertRestSuccess(deleteResult, [204], 'delete trailer')
  })
})
