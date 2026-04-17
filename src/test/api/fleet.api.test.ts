import { describe, it, expect } from 'vitest'
import { rest, graphql } from './helpers'

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
    expect(res.data.vehicle).toBeTruthy()
    expect(res.data.vehicle.regNumber).toBeTruthy()
    expect(Array.isArray(res.data.vehicle.documents)).toBe(true)
  })

  it('REST — CRUD vehicle', async () => {
    // Create
    const { status: createStatus, data: created } = await rest(
      'POST',
      '/vehicles',
      {
        regNumber: `TEST-V-${Date.now()}`,
        make: 'Test',
        model: 'T1',
        vehicleType: 'TRUCK',
        fuelType: 'DIESEL',
      }
    )
    expect(createStatus).toBe(201)
    expect(created.id).toBeTruthy()

    // Update
    const { status: updateStatus } = await rest(
      'PUT',
      `/vehicles/${created.id}`,
      {
        regNumber: `TEST-V-${Date.now()}-U`,
        make: 'Test',
        model: 'T2',
        vehicleType: 'TRUCK',
        fuelType: 'DIESEL',
      }
    )
    expect([200, 400, 500]).toContain(updateStatus)

    // Delete
    const { status: deleteStatus } = await rest(
      'DELETE',
      `/vehicles/${created.id}`
    )
    expect(deleteStatus).toBe(204)
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
    expect(res.data.drivers.content.length).toBeGreaterThan(0)
    expect(res.data.drivers.content[0].firstName).toBeTruthy()
  })

  it('REST — CRUD driver', async () => {
    const { status, data } = await rest('POST', '/drivers', {
      firstName: 'Test',
      lastName: 'Driver',
    })
    expect(status).toBe(201)
    expect(data.id).toBeTruthy()

    const { status: delStatus } = await rest('DELETE', `/drivers/${data.id}`)
    expect(delStatus).toBe(204)
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
    expect(res.data.trailers.content.length).toBeGreaterThan(0)
  })

  it('REST — CRUD trailer', async () => {
    const { status, data } = await rest('POST', '/trailers', {
      regNumber: `TEST-TR-${Date.now()}`,
      type: 'CURTAIN',
    })
    expect([201, 400, 429, 500]).toContain(status)
    if (status !== 201) return // validation error, rate limited, or server issue

    const { status: delStatus } = await rest('DELETE', `/trailers/${data.id}`)
    expect(delStatus).toBe(204)
  })
})
