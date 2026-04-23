import { describe, it, expect } from 'vitest'
import { rest, graphql } from './helpers'
import { assertRestSuccess, assertGraphqlSuccess } from './assert-helpers'

describe('Permits API', () => {
  it('REST — list permits with pagination', async () => {
    const result = await rest('GET', '/permits?page=0&size=5')
    assertRestSuccess(result, [200], 'list permits')
    expect(Array.isArray(result.data.content)).toBe(true)
    expect(typeof result.data.totalElements).toBe('number')
    expect(typeof result.data.totalPages).toBe('number')
  })

  it('REST — list permits with filter', async () => {
    const result = await rest('GET', '/permits?status=AVAILABLE&page=0&size=5')
    assertRestSuccess(result, [200], 'list permits filtered')
    for (const p of result.data.content) {
      expect(p.status).toBe('AVAILABLE')
    }
  })

  it('REST — permit response shape', async () => {
    const result = await rest('GET', '/permits?page=0&size=1')
    assertRestSuccess(result, [200], 'permit shape check')
    if (result.data.content.length === 0) return

    const p = result.data.content[0]
    expect(p).toHaveProperty('id')
    expect(p).toHaveProperty('permitType')
    expect(p).toHaveProperty('permitNumber')
    expect(p).toHaveProperty('validFrom')
    expect(p).toHaveProperty('validTo')
    expect(p).toHaveProperty('status')
  })

  it('REST — CRUD permit', async () => {
    // Create
    const createResult = await rest('POST', '/permits', {
      permitType: 'BILATERAL',
      countryCode: 'DE',
      countryName: 'Nemačka',
      permitNumber: `TEST-P-${Date.now()}`,
      validFrom: '2026-01-01',
      validTo: '2026-12-31',
    })
    assertRestSuccess(createResult, [201], 'create permit')
    expect(createResult.data.id).toBeTruthy()

    // Update
    const updateResult = await rest('PUT', `/permits/${createResult.data.id}`, {
      permitType: 'BILATERAL',
      countryCode: 'DE',
      countryName: 'Nemačka',
      permitNumber: `TEST-P-${Date.now()}-U`,
      validFrom: '2026-01-01',
      validTo: '2026-12-31',
      notes: 'Updated',
    })
    assertRestSuccess(updateResult, [200], 'update permit')

    // Delete
    const deleteResult = await rest(
      'DELETE',
      `/permits/${createResult.data.id}`
    )
    assertRestSuccess(deleteResult, [204], 'delete permit')
  })

  it('REST — assign and release permit', async () => {
    // Create a permit
    const createResult = await rest('POST', '/permits', {
      permitType: 'CEMT',
      permitNumber: `TEST-ASSIGN-${Date.now()}`,
      validFrom: '2026-01-01',
      validTo: '2026-12-31',
    })
    assertRestSuccess(createResult, [201], 'create permit for assign')

    // Get a vehicle to assign to
    const vehiclesRes = await graphql(`
      {
        vehicles(page: 0, size: 1) {
          content {
            id
          }
        }
      }
    `)
    assertGraphqlSuccess(vehiclesRes, 'vehicles for permit assign')
    const vehicleId = vehiclesRes.data?.vehicles?.content[0]?.id
    if (!vehicleId) {
      await rest('DELETE', `/permits/${createResult.data.id}`)
      throw new Error('No vehicles available to test permit assignment')
    }

    // Assign
    const assignResult = await rest(
      'POST',
      `/permits/${createResult.data.id}/assign`,
      {
        vehicleId: Number(vehicleId),
      }
    )
    assertRestSuccess(assignResult, [200, 204], 'assign permit')

    // Release
    const releaseResult = await rest(
      'POST',
      `/permits/${createResult.data.id}/release`
    )
    assertRestSuccess(releaseResult, [200, 204], 'release permit')

    // Cleanup
    await rest('DELETE', `/permits/${createResult.data.id}`)
  })

  it('REST — mark permit as used', async () => {
    const createResult = await rest('POST', '/permits', {
      permitType: 'BILATERAL',
      countryCode: 'AT',
      countryName: 'Austrija',
      permitNumber: `TEST-USED-${Date.now()}`,
      validFrom: '2026-01-01',
      validTo: '2026-12-31',
    })
    assertRestSuccess(createResult, [201], 'create permit for mark-used')

    const vehiclesRes = await graphql(`
      {
        vehicles(page: 0, size: 1) {
          content {
            id
          }
        }
      }
    `)
    assertGraphqlSuccess(vehiclesRes, 'vehicles for mark-used')
    const vehicleId = vehiclesRes.data?.vehicles?.content[0]?.id
    if (!vehicleId) {
      await rest('DELETE', `/permits/${createResult.data.id}`)
      throw new Error('No vehicles available to test mark-used')
    }

    await rest('POST', `/permits/${createResult.data.id}/assign`, {
      vehicleId: Number(vehicleId),
    })
    const usedResult = await rest(
      'POST',
      `/permits/${createResult.data.id}/mark-used`
    )
    assertRestSuccess(usedResult, [200, 204], 'mark permit used')

    // Cleanup — used permits may not be deletable
    await rest('DELETE', `/permits/${createResult.data.id}`)
  })

  it('REST — get expiring permits', async () => {
    const result = await rest('GET', '/permits/expiring?days=30')
    assertRestSuccess(result, [200], 'expiring permits')
    expect(Array.isArray(result.data)).toBe(true)
  })
})
