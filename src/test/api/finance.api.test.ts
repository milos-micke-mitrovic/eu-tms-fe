import { describe, it, expect } from 'vitest'
import { rest, graphql } from './helpers'

describe('Exchange Rates API', () => {
  it('REST — get exchange rates', async () => {
    const { status, data } = await rest(
      'GET',
      '/exchange-rates?date=2026-04-10'
    )
    expect(status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
  })

  it('GraphQL — exchange rates', async () => {
    const res = await graphql(`
      {
        exchangeRates(date: "2026-04-10") {
          currencyCode
          rateToRsd
          rateDate
        }
      }
    `)
    expect(Array.isArray(res.data.exchangeRates)).toBe(true)
  })
})

describe('Per Diem API', () => {
  it('GraphQL — per diem rates', async () => {
    const res = await graphql(`
      {
        perDiemRates {
          countryCode
          countryNameSr
          dailyAmount
          currency
        }
      }
    `)
    expect(Array.isArray(res.data.perDiemRates)).toBe(true)
  })
})

describe('Invoices API', () => {
  it('GraphQL — list invoices', async () => {
    const res = await graphql(`
      {
        invoices(page: 0, size: 5) {
          content {
            id
            invoiceNumber
            paymentStatus
          }
          totalElements
        }
      }
    `)
    expect(res.data.invoices).toBeTruthy()
    expect(res.data.invoices.totalElements).toBeGreaterThanOrEqual(0)
  })

  it('REST — CRUD invoice', async () => {
    const partners = await graphql(`
      {
        partners(page: 0, size: 1) {
          content {
            id
          }
        }
      }
    `)
    const partnerId = Number(partners.data.partners.content[0].id)

    // Create
    const { status, data } = await rest('POST', '/invoices', {
      partnerId,
      invoiceDate: '2026-04-10',
      dueDate: '2026-05-10',
      currency: 'RSD',
      vatRate: 20,
      items: [
        {
          description: 'Transport test',
          quantity: 1,
          unit: 'kom',
          unitPrice: 10000,
        },
      ],
    })
    expect(status).toBe(201)
    expect(data.invoiceNumber).toBeTruthy()

    // Delete — may be 204 or 403 (SPEDITER role may not have delete permission)
    const { status: delStatus } = await rest('DELETE', `/invoices/${data.id}`)
    expect([204, 403]).toContain(delStatus)
  })
})

describe('Vehicle UPDATE (was bug)', () => {
  it('PUT /api/vehicles/{id} returns 200', async () => {
    const vehicles = await graphql(`
      {
        vehicles(page: 0, size: 1) {
          content {
            id
            regNumber
            make
            model
            vehicleType
            fuelType
          }
        }
      }
    `)
    const v = vehicles.data.vehicles.content[0]

    const { status } = await rest('PUT', `/vehicles/${v.id}`, {
      regNumber: v.regNumber,
      make: v.make,
      model: v.model,
      vehicleType: v.vehicleType,
      fuelType: v.fuelType,
    })
    expect(status).toBe(200)
  })
})

describe('Expiring Documents (was bug)', () => {
  it('GraphQL — returns data', async () => {
    const res = await graphql(`
      {
        expiringDocuments(days: 30) {
          entityType
          entityName
          documentType
          expirationDate
          daysUntilExpiry
        }
      }
    `)
    expect(res.data).toBeTruthy()
    expect(Array.isArray(res.data.expiringDocuments)).toBe(true)
  })
})
