import { describe, it, expect } from 'vitest'
import { graphql } from './helpers'
import { assertGraphqlSuccess } from './assert-helpers'

describe('Fuel API', () => {
  it('GraphQL — list fuel tanks', async () => {
    const res = await graphql(`
      {
        fuelTanks {
          id
          name
          capacityLiters
          currentLevelLiters
          fuelType
          percentFull
          location
        }
      }
    `)
    assertGraphqlSuccess(res, 'fuelTanks')
    expect(Array.isArray(res.data.fuelTanks)).toBe(true)
    expect(res.data.fuelTanks.length).toBeGreaterThan(0)
    const tank = res.data.fuelTanks[0]
    expect(tank.name).toBeTruthy()
    expect(Number(tank.capacityLiters)).toBeGreaterThan(0)
    expect(Number(tank.percentFull)).toBeGreaterThanOrEqual(0)
    expect(Number(tank.percentFull)).toBeLessThanOrEqual(100)
  })
})
