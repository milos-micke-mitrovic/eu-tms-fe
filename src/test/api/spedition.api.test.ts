import { describe, it, expect } from 'vitest'
import { rest, graphql } from './helpers'
import { assertRestSuccess, assertGraphqlSuccess } from './assert-helpers'

describe('Routes API', () => {
  it('GraphQL — list routes with pagination', async () => {
    const res = await graphql(`
      {
        routes(page: 0, size: 10) {
          content {
            id
            internalNumber
            routeType
            status
            price
            currency
            totalExpenseRsd
            profit
          }
          totalElements
          totalPages
        }
      }
    `)
    assertGraphqlSuccess(res, 'routes list')
    expect(res.data.routes.content.length).toBeGreaterThan(0)
    expect(res.data.routes.content[0].internalNumber).toMatch(/^RT-/)
  })

  it('GraphQL — filter by status', async () => {
    const res = await graphql(`
      {
        routes(status: "COMPLETED", page: 0, size: 10) {
          content {
            status
          }
        }
      }
    `)
    assertGraphqlSuccess(res, 'routes filter by status')
    for (const r of res.data.routes.content) {
      expect(r.status).toBe('COMPLETED')
    }
  })

  it('GraphQL — route detail with nested data', async () => {
    const listRes = await graphql(`
      {
        routes(page: 0, size: 1) {
          content {
            id
          }
        }
      }
    `)
    assertGraphqlSuccess(listRes, 'routes list for detail')
    const id = listRes.data.routes.content[0].id

    const res = await graphql(
      `
        query ($id: ID!) {
          route(id: $id) {
            id
            internalNumber
            routeType
            status
            partnerId
            vehicleId
            driverId
            trailerId
            departureDate
            returnDate
            cargoDescription
            price
            currency
            distanceKm
            notes
            stops {
              id
              stopOrder
              stopType
              city
              countryCode
            }
            expenses {
              id
              category
              amount
              currency
              amountRsd
              status
            }
            totalExpenseRsd
            profit
          }
        }
      `,
      { id }
    )
    assertGraphqlSuccess(res, 'route detail')
    expect(res.data.route).toBeTruthy()
    expect(Array.isArray(res.data.route.stops)).toBe(true)
    expect(Array.isArray(res.data.route.expenses)).toBe(true)
  })

  it('REST — create and delete route', async () => {
    const partners = await graphql(`
      {
        partners(page: 0, size: 1) {
          content {
            id
          }
        }
      }
    `)
    assertGraphqlSuccess(partners, 'partners for route create')
    const partnerId = Number(partners.data.partners.content[0].id)

    const createResult = await rest('POST', '/routes', {
      routeType: 'DOMESTIC',
      partnerId,
      cargoDescription: 'Test cargo',
    })
    assertRestSuccess(createResult, [201], 'create route')
    expect(createResult.data.internalNumber).toMatch(/^RT-/)
    expect(createResult.data.status).toBe('CREATED')

    const deleteResult = await rest('DELETE', `/routes/${createResult.data.id}`)
    assertRestSuccess(deleteResult, [204], 'delete route')
  })

  it('REST — status transitions', async () => {
    const partners = await graphql(`
      {
        partners(page: 0, size: 1) {
          content {
            id
          }
        }
      }
    `)
    assertGraphqlSuccess(partners, 'partners for status transitions')
    const partnerId = Number(partners.data.partners.content[0].id)

    const { data: route } = await rest('POST', '/routes', {
      routeType: 'DOMESTIC',
      partnerId,
      cargoDescription: 'Status test',
    })
    expect(route.status).toBe('CREATED')

    // CREATED -> DISPATCHED
    const dispatch = await rest('PATCH', `/routes/${route.id}/status`, {
      newStatus: 'DISPATCHED',
    })
    assertRestSuccess(dispatch, [200], 'dispatch route')
    expect(dispatch.data.status).toBe('DISPATCHED')

    // DISPATCHED -> IN_TRANSIT
    const transit = await rest('PATCH', `/routes/${route.id}/status`, {
      newStatus: 'IN_TRANSIT',
    })
    assertRestSuccess(transit, [200], 'transit route')
    expect(transit.data.status).toBe('IN_TRANSIT')

    // Cleanup
    await rest('DELETE', `/routes/${route.id}`)
  })
})

describe('Expenses API', () => {
  it('GraphQL — expense summary by category', async () => {
    const res = await graphql(`
      {
        expenseSummary(
          from: "2026-01-01"
          to: "2026-12-31"
          groupBy: "CATEGORY"
        ) {
          key
          totalAmountRsd
        }
      }
    `)
    assertGraphqlSuccess(res, 'expenseSummary')
    expect(Array.isArray(res.data.expenseSummary)).toBe(true)
  })

  it('REST — create and delete expense', async () => {
    // Get a route with suitable status
    const routes = await graphql(`
      {
        routes(page: 0, size: 10) {
          content {
            id
            status
          }
        }
      }
    `)
    assertGraphqlSuccess(routes, 'routes for expense create')
    const route = routes.data.routes.content.find((r: { status: string }) =>
      ['CREATED', 'DISPATCHED', 'IN_TRANSIT', 'COMPLETED'].includes(r.status)
    )
    expect(route).toBeTruthy()

    const createResult = await rest('POST', '/expenses', {
      routeId: Number(route.id),
      category: 'FUEL',
      amount: 100,
      currency: 'EUR',
      expenseDate: '2026-04-10',
    })
    assertRestSuccess(createResult, [201], 'create expense')
    expect(createResult.data.category).toBe('FUEL')

    const deleteResult = await rest(
      'DELETE',
      `/expenses/${createResult.data.id}`
    )
    assertRestSuccess(deleteResult, [204], 'delete expense')
  })
})
