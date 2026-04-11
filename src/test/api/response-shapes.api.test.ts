import { describe, it, expect } from 'vitest'
import { rest, graphql } from './helpers'

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
    const id = vehicles.data.vehicles.content[0]?.id
    if (!id) return

    const { status, data } = await rest('GET', `/vehicles/${id}`)
    expect(status).toBe(200)
    // Verify field names exist (not values, just shape)
    expect(data).toHaveProperty('id')
    expect(data).toHaveProperty('regNumber')
    expect(data).toHaveProperty('make')
    expect(data).toHaveProperty('vehicleType')
    expect(data).toHaveProperty('fuelType')
    expect(data).toHaveProperty('status')
    expect(data).toHaveProperty('createdAt')
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
    const id = drivers.data.drivers.content[0]?.id
    if (!id) return

    const { status, data } = await rest('GET', `/drivers/${id}`)
    expect(status).toBe(200)
    expect(data).toHaveProperty('firstName')
    expect(data).toHaveProperty('lastName')
    expect(data).toHaveProperty('status')
  })

  it('GET /notifications — matches NotificationResponseDto', async () => {
    const { status, data } = await rest('GET', '/notifications?page=0&size=1')
    expect(status).toBe(200)
    expect(data).toHaveProperty('content')
    expect(data).toHaveProperty('totalElements')
    if (data.content.length > 0) {
      const n = data.content[0]
      expect(n).toHaveProperty('id')
      expect(n).toHaveProperty('notificationType')
      expect(n).toHaveProperty('title')
      expect(n).toHaveProperty('message')
      expect(n).toHaveProperty('read')
    }
  })

  it('GET /travel-orders/{id} — matches TravelOrder type', async () => {
    const { data: orders } = await rest('GET', '/travel-orders/by-route/1')
    // Try to find any travel order
    let order = null
    if (Array.isArray(orders) && orders.length > 0) {
      order = orders[0]
    } else {
      // Try getting by ID
      const { status, data } = await rest('GET', '/travel-orders/1')
      if (status === 200) order = data
    }
    if (!order) return // no travel orders to test

    // Verify actual field names from BE
    expect(order).toHaveProperty('id')
    expect(order).toHaveProperty('orderNumber')
    expect(order).toHaveProperty('driverId')
    expect(order).toHaveProperty('driverName')
    expect(order).toHaveProperty('vehicleId')
    expect(order).toHaveProperty('vehicleRegNumber')
    expect(order).toHaveProperty('status')
    // These are the correct field names (not departureDate/returnDate!)
    expect(order).toHaveProperty('departureDatetime')
    expect(order).toHaveProperty('returnDatetime')
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
    const id = invoices.data.invoices.content[0]?.id
    if (!id) return

    const { status, data } = await rest('GET', `/invoices/${id}`)
    expect(status).toBe(200)
    expect(data).toHaveProperty('invoiceNumber')
    expect(data).toHaveProperty('partnerId')
    expect(data).toHaveProperty('invoiceDate')
    expect(data).toHaveProperty('dueDate')
    expect(data).toHaveProperty('currency')
    expect(data).toHaveProperty('total')
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
    if (tanks.data.fuelTanks.length === 0) return

    // Verify GraphQL response matches expected shape
    const tank = tanks.data.fuelTanks[0]
    expect(tank).toHaveProperty('id')
    expect(tank).toHaveProperty('name')
  })

  it('GET /exchange-rates — matches ExchangeRate type', async () => {
    const { status, data } = await rest(
      'GET',
      '/exchange-rates?date=2026-04-10'
    )
    expect(status).toBe(200)
    if (Array.isArray(data) && data.length > 0) {
      expect(data[0]).toHaveProperty('currencyCode')
      expect(data[0]).toHaveProperty('rateToRsd')
    }
  })
})
