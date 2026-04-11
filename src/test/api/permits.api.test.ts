import { describe, it, expect } from 'vitest'
import { rest, graphql } from './helpers'

describe('Permits API', () => {
  it('REST — list permits with pagination', async () => {
    const { status, data } = await rest('GET', '/permits?page=0&size=5')
    expect(status).toBe(200)
    expect(Array.isArray(data.content)).toBe(true)
    expect(typeof data.totalElements).toBe('number')
    expect(typeof data.totalPages).toBe('number')
  })

  it('REST — list permits with filter', async () => {
    const { status, data } = await rest(
      'GET',
      '/permits?status=AVAILABLE&page=0&size=5'
    )
    expect(status).toBe(200)
    for (const p of data.content) {
      expect(p.status).toBe('AVAILABLE')
    }
  })

  it('REST — permit response shape', async () => {
    const { data } = await rest('GET', '/permits?page=0&size=1')
    if (data.content.length === 0) return

    const p = data.content[0]
    expect(p).toHaveProperty('id')
    expect(p).toHaveProperty('permitType')
    expect(p).toHaveProperty('permitNumber')
    expect(p).toHaveProperty('validFrom')
    expect(p).toHaveProperty('validTo')
    expect(p).toHaveProperty('status')
  })

  it('REST — CRUD permit', async () => {
    // Create
    const { status: createStatus, data: created } = await rest(
      'POST',
      '/permits',
      {
        permitType: 'BILATERAL',
        countryCode: 'DE',
        countryName: 'Nemačka',
        permitNumber: `TEST-P-${Date.now()}`,
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
      }
    )
    expect(createStatus).toBe(201)
    expect(created.id).toBeTruthy()

    // Update
    const { status: updateStatus } = await rest(
      'PUT',
      `/permits/${created.id}`,
      {
        permitType: 'BILATERAL',
        countryCode: 'DE',
        countryName: 'Nemačka',
        permitNumber: `TEST-P-${Date.now()}-U`,
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
        notes: 'Updated',
      }
    )
    expect(updateStatus).toBe(200)

    // Delete
    const { status: deleteStatus } = await rest(
      'DELETE',
      `/permits/${created.id}`
    )
    expect(deleteStatus).toBe(204)
  })

  it('REST — assign and release permit', async () => {
    // Create a permit
    const { status: createStatus, data: permit } = await rest(
      'POST',
      '/permits',
      {
        permitType: 'CEMT',
        permitNumber: `TEST-ASSIGN-${Date.now()}`,
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
      }
    )
    if (createStatus !== 201) return

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
    const vehicleId = vehiclesRes.data?.vehicles?.content[0]?.id
    if (!vehicleId) {
      await rest('DELETE', `/permits/${permit.id}`)
      return
    }

    // Assign
    const { status: assignStatus } = await rest(
      'POST',
      `/permits/${permit.id}/assign`,
      { vehicleId: Number(vehicleId) }
    )
    expect([200, 204]).toContain(assignStatus)

    // Release
    const { status: releaseStatus } = await rest(
      'POST',
      `/permits/${permit.id}/release`
    )
    expect([200, 204]).toContain(releaseStatus)

    // Cleanup
    await rest('DELETE', `/permits/${permit.id}`)
  })

  it('REST — mark permit as used', async () => {
    const { status: createStatus, data: permit } = await rest(
      'POST',
      '/permits',
      {
        permitType: 'BILATERAL',
        countryCode: 'AT',
        countryName: 'Austrija',
        permitNumber: `TEST-USED-${Date.now()}`,
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
      }
    )
    if (createStatus !== 201) return

    const vehiclesRes = await graphql(`
      {
        vehicles(page: 0, size: 1) {
          content {
            id
          }
        }
      }
    `)
    const vehicleId = vehiclesRes.data?.vehicles?.content[0]?.id
    if (!vehicleId) {
      await rest('DELETE', `/permits/${permit.id}`)
      return
    }

    await rest('POST', `/permits/${permit.id}/assign`, {
      vehicleId: Number(vehicleId),
    })
    const { status: usedStatus } = await rest(
      'POST',
      `/permits/${permit.id}/mark-used`
    )
    expect([200, 204]).toContain(usedStatus)

    // Cleanup — used permits may not be deletable
    await rest('DELETE', `/permits/${permit.id}`)
  })

  it('REST — get expiring permits', async () => {
    const { status, data } = await rest('GET', '/permits/expiring?days=30')
    expect(status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
  })
})
