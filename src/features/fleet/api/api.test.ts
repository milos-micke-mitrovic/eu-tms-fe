import { describe, it, expect } from 'vitest'
import { GET_VEHICLES, GET_VEHICLE } from './use-vehicles'
import { GET_DRIVERS, GET_DRIVER } from './use-drivers'
import { GET_TRAILERS } from './use-trailers'

describe('GraphQL queries - Fleet', () => {
  it('GET_VEHICLES has sorting + pagination', () => {
    const query = GET_VEHICLES.loc?.source.body ?? ''
    expect(query).toContain('query GetVehicles')
    expect(query).toContain('$sortBy: String')
    expect(query).toContain('$sortDir: String')
    expect(query).toContain('regNumber')
    expect(query).toContain('totalElements')
  })

  it('GET_VEHICLE detail has documents', () => {
    const query = GET_VEHICLE.loc?.source.body ?? ''
    expect(query).toContain('query GetVehicle')
    expect(query).toContain('documents {')
    expect(query).toContain('documentType')
    expect(query).toContain('expirationDate')
  })

  it('GET_DRIVERS has sorting + pagination', () => {
    const query = GET_DRIVERS.loc?.source.body ?? ''
    expect(query).toContain('query GetDrivers')
    expect(query).toContain('$sortBy: String')
    expect(query).toContain('firstName')
    expect(query).toContain('totalElements')
  })

  it('GET_DRIVER detail has documents', () => {
    const query = GET_DRIVER.loc?.source.body ?? ''
    expect(query).toContain('query GetDriver')
    expect(query).toContain('documents {')
  })

  it('GET_TRAILERS has sorting', () => {
    const query = GET_TRAILERS.loc?.source.body ?? ''
    expect(query).toContain('query GetTrailers')
    expect(query).toContain('$sortBy: String')
    expect(query).toContain('regNumber')
  })
})
