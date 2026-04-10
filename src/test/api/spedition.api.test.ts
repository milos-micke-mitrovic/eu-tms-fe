import { describe, it, expect } from 'vitest'
import { rest, graphql } from './helpers'

describe('Routes API', () => {
  it('GraphQL — list routes with pagination', async () => {
    const res = await graphql(`{
      routes(page: 0, size: 10) {
        content { id internalNumber routeType status price currency totalExpenseRsd profit }
        totalElements totalPages
      }
    }`)
    expect(res.data.routes.content.length).toBeGreaterThan(0)
    expect(res.data.routes.content[0].internalNumber).toMatch(/^RT-/)
  })

  it('GraphQL — filter by status', async () => {
    const res = await graphql(`{
      routes(status: "COMPLETED", page: 0, size: 10) {
        content { status }
      }
    }`)
    for (const r of res.data.routes.content) {
      expect(r.status).toBe('COMPLETED')
    }
  })

  it('GraphQL — route detail with nested data', async () => {
    const listRes = await graphql(`{ routes(page: 0, size: 1) { content { id } } }`)
    const id = listRes.data.routes.content[0].id

    const res = await graphql(`query ($id: ID!) {
      route(id: $id) {
        id internalNumber routeType status
        partnerId vehicleId driverId trailerId
        departureDate returnDate cargoDescription
        price currency distanceKm notes
        stops { id stopOrder stopType city countryCode }
        expenses { id category amount currency amountRsd status }
        totalExpenseRsd profit
      }
    }`, { id })
    expect(res.data.route).toBeTruthy()
    expect(Array.isArray(res.data.route.stops)).toBe(true)
    expect(Array.isArray(res.data.route.expenses)).toBe(true)
  })

  it('REST — create and delete route', async () => {
    // Get a partner ID first
    const partners = await graphql(`{ partners(page: 0, size: 1) { content { id } } }`)
    const partnerId = Number(partners.data.partners.content[0].id)

    const { status, data } = await rest('POST', '/routes', {
      routeType: 'DOMESTIC', partnerId, cargoDescription: 'Test cargo',
    })
    expect(status).toBe(201)
    expect(data.internalNumber).toMatch(/^RT-/)
    expect(data.status).toBe('CREATED')

    const { status: delStatus } = await rest('DELETE', `/routes/${data.id}`)
    expect(delStatus).toBe(204)
  })

  it('REST — status transitions', async () => {
    const partners = await graphql(`{ partners(page: 0, size: 1) { content { id } } }`)
    const partnerId = Number(partners.data.partners.content[0].id)

    const { data: route } = await rest('POST', '/routes', {
      routeType: 'DOMESTIC', partnerId, cargoDescription: 'Status test',
    })
    expect(route.status).toBe('CREATED')

    // CREATED → DISPATCHED
    const { status: s1, data: d1 } = await rest('PATCH', `/routes/${route.id}/status`, { newStatus: 'DISPATCHED' })
    expect(s1).toBe(200)
    expect(d1.status).toBe('DISPATCHED')

    // DISPATCHED → IN_TRANSIT
    const { status: s2, data: d2 } = await rest('PATCH', `/routes/${route.id}/status`, { newStatus: 'IN_TRANSIT' })
    expect(s2).toBe(200)
    expect(d2.status).toBe('IN_TRANSIT')

    // Cleanup
    await rest('DELETE', `/routes/${route.id}`)
  })
})

describe('Expenses API', () => {
  it('GraphQL — expense summary by category', async () => {
    const res = await graphql(`{
      expenseSummary(from: "2026-01-01", to: "2026-12-31", groupBy: "CATEGORY") {
        key totalAmountRsd
      }
    }`)
    expect(Array.isArray(res.data.expenseSummary)).toBe(true)
  })

  it('REST — create and delete expense', async () => {
    // Get a route with CREATED status
    const routes = await graphql(`{ routes(page: 0, size: 10) { content { id status } } }`)
    const route = routes.data.routes.content.find((r: { status: string }) =>
      ['CREATED', 'DISPATCHED', 'IN_TRANSIT', 'COMPLETED'].includes(r.status)
    )
    if (!route) return // skip if no suitable route

    const { status, data } = await rest('POST', '/expenses', {
      routeId: Number(route.id), category: 'FUEL', amount: 100, currency: 'EUR', expenseDate: '2026-04-10',
    })
    expect(status).toBe(201)
    expect(data.category).toBe('FUEL')

    const { status: delStatus } = await rest('DELETE', `/expenses/${data.id}`)
    expect(delStatus).toBe(204)
  })
})
