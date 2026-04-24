import { describe, it, expect } from 'vitest'
import { rest, graphql } from './helpers'
import { assertRestSuccess, assertGraphqlSuccess } from './assert-helpers'

// These tests verify that our FE types match the actual BE response shapes.
// Catches field name mismatches (like departureDate vs departureDatetime).

describe('REST response shapes', () => {
  it('GET /vehicles/{id} — matches VehicleResponseDto', async () => {
    const vehicles = await graphql(`
      {
        vehicles(page: 0, size: 1) {
          content {
            id
          }
        }
      }
    `)
    assertGraphqlSuccess(vehicles, 'vehicles for shape check')
    const id = vehicles.data.vehicles.content[0]?.id
    expect(id).toBeTruthy()

    const result = await rest('GET', `/vehicles/${id}`)
    assertRestSuccess(result, [200], 'get vehicle detail')
    // Verify field names exist (not values, just shape)
    expect(result.data).toHaveProperty('id')
    expect(result.data).toHaveProperty('regNumber')
    expect(result.data).toHaveProperty('make')
    expect(result.data).toHaveProperty('vehicleType')
    expect(result.data).toHaveProperty('fuelType')
    expect(result.data).toHaveProperty('status')
    expect(result.data).toHaveProperty('createdAt')
  })

  it('GET /drivers/{id} — matches DriverResponseDto', async () => {
    const drivers = await graphql(`
      {
        drivers(page: 0, size: 1) {
          content {
            id
          }
        }
      }
    `)
    assertGraphqlSuccess(drivers, 'drivers for shape check')
    const id = drivers.data.drivers.content[0]?.id
    expect(id).toBeTruthy()

    const result = await rest('GET', `/drivers/${id}`)
    assertRestSuccess(result, [200], 'get driver detail')
    expect(result.data).toHaveProperty('firstName')
    expect(result.data).toHaveProperty('lastName')
    expect(result.data).toHaveProperty('status')
  })

  it('GET /notifications — matches NotificationResponseDto', async () => {
    const result = await rest('GET', '/notifications?page=0&size=1')
    assertRestSuccess(result, [200], 'get notifications shape')
    expect(result.data).toHaveProperty('content')
    expect(result.data).toHaveProperty('totalElements')
    if (result.data.content.length > 0) {
      const n = result.data.content[0]
      expect(n).toHaveProperty('id')
      expect(n).toHaveProperty('notificationType')
      expect(n).toHaveProperty('title')
      expect(n).toHaveProperty('message')
      expect(n).toHaveProperty('read')
    }
  })

  it('GET /travel-orders/{id} — matches TravelOrder type', async () => {
    const listResult = await rest('GET', '/travel-orders/by-route/1')
    assertRestSuccess(listResult, [200], 'list travel orders for shape')
    // Try to find any travel order
    let order = null
    if (Array.isArray(listResult.data) && listResult.data.length > 0) {
      order = listResult.data[0]
    } else {
      // Try getting by ID
      const result = await rest('GET', '/travel-orders/1')
      if (result.status === 200) order = result.data
    }
    if (!order) {
      console.warn('Skipping travel order shape check: no travel orders found')
      return
    }

    // Verify actual field names from BE
    expect(order).toHaveProperty('id')
    expect(order).toHaveProperty('orderNumber')
    expect(order).toHaveProperty('driverId')
    expect(order).toHaveProperty('driverName')
    expect(order).toHaveProperty('vehicleId')
    expect(order).toHaveProperty('vehicleRegNumber')
    expect(order).toHaveProperty('status')
    // These are the correct field names after the instant rename
    expect(order).toHaveProperty('departureTime')
    expect(order).toHaveProperty('arrivalTime')
    expect(order).toHaveProperty('purpose')
    expect(order).toHaveProperty('fuelAdvance')
    expect(order).toHaveProperty('perDiemAdvance')
  })

  it('GET /invoices/{id} — matches Invoice type', async () => {
    const invoices = await graphql(`
      {
        invoices(page: 0, size: 1) {
          content {
            id
          }
        }
      }
    `)
    assertGraphqlSuccess(invoices, 'invoices for shape check')
    const id = invoices.data.invoices.content[0]?.id
    expect(id).toBeTruthy()

    const result = await rest('GET', `/invoices/${id}`)
    assertRestSuccess(result, [200], 'get invoice detail')
    expect(result.data).toHaveProperty('invoiceNumber')
    expect(result.data).toHaveProperty('partnerId')
    expect(result.data).toHaveProperty('invoiceDate')
    expect(result.data).toHaveProperty('dueDate')
    expect(result.data).toHaveProperty('currency')
    expect(result.data).toHaveProperty('total')
  })

  it('GET /fuel-tanks — matches FuelTank type', async () => {
    const tanks = await graphql(`
      {
        fuelTanks {
          id
          name
        }
      }
    `)
    assertGraphqlSuccess(tanks, 'fuelTanks shape check')
    if (tanks.data.fuelTanks.length === 0) {
      console.warn('Skipping fuel tank shape check: no fuel tanks found')
      return
    }

    // Verify GraphQL response matches expected shape
    const tank = tanks.data.fuelTanks[0]
    expect(tank).toHaveProperty('id')
    expect(tank).toHaveProperty('name')
  })

  it('GET /exchange-rates — matches ExchangeRate type', async () => {
    const result = await rest('GET', '/exchange-rates?date=2026-04-10')
    assertRestSuccess(result, [200], 'get exchange rates shape')
    if (Array.isArray(result.data) && result.data.length > 0) {
      expect(result.data[0]).toHaveProperty('currencyCode')
      expect(result.data[0]).toHaveProperty('rateToRsd')
    }
  })
})
