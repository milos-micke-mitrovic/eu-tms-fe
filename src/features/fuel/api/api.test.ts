import { describe, it, expect } from 'vitest'
import { GET_FUEL_TANKS } from './use-fuel'

describe('GraphQL queries - Fuel', () => {
  it('GET_FUEL_TANKS has required fields', () => {
    const query = GET_FUEL_TANKS.loc?.source.body ?? ''
    expect(query).toContain('query GetFuelTanks')
    expect(query).toContain('name')
    expect(query).toContain('capacityLiters')
    expect(query).toContain('currentLevelLiters')
    expect(query).toContain('fuelType')
    expect(query).toContain('percentFull')
  })
})
