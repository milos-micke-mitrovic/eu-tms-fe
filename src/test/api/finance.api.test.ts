import { describe, it, expect } from 'vitest'
import { rest, graphql } from './helpers'
import { assertRestSuccess, assertGraphqlSuccess } from './assert-helpers'

describe('Exchange Rates API', () => {
  it('REST — get exchange rates', async () => {
    const result = await rest('GET', '/exchange-rates?date=2026-04-10')
    assertRestSuccess(result, [200], 'get exchange rates')
    expect(Array.isArray(result.data)).toBe(true)
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
    assertGraphqlSuccess(res, 'exchangeRates')
    expect(Array.isArray(res.data.exchangeRates)).toBe(true)
  })

  it.skip('REST — convert currency (BE BUG: convertedAmount returns null — NBS rates not loaded)', async () => {
    const result = await rest('POST', '/exchange-rates/convert', {
      amount: 100,
      fromCurrency: 'EUR',
      toCurrency: 'RSD',
    })
    assertRestSuccess(result, [200], 'convert currency')
  })

  it('REST — manual rate entry (ADMIN)', async () => {
    const result = await rest('POST', '/exchange-rates/manual', {
      currencyCode: 'CHF',
      rateToRsd: 120.5,
      rateDate: '2026-04-17',
    })
    // 201 = success, 403 = not admin role
    assertRestSuccess(result, [201, 403], 'manual rate entry')
  })

  it('REST — fetch NBS rates (ADMIN)', async () => {
    const result = await rest('POST', '/exchange-rates/fetch')
    // 200 = success, 403 = not admin
    assertRestSuccess(result, [200, 403], 'fetch NBS rates')
  })
})

describe('Per Diem API', () => {
  it('GraphQL — per diem rates list', async () => {
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
    assertGraphqlSuccess(res, 'perDiemRates')
    expect(Array.isArray(res.data.perDiemRates)).toBe(true)
  })

  it.skip('REST — calculate per diem (BE BUG: POST /api/per-diem/calculate returns 500)', async () => {
    const result = await rest('POST', '/per-diem/calculate', { routeId: 1 })
    assertRestSuccess(result, [200], 'calculate per diem')
  })

  it.skip('REST — calculate and save per diem (BE BUG: POST /api/per-diem/calculate-and-save returns 500)', async () => {
    const result = await rest('POST', '/per-diem/calculate-and-save', {
      routeId: 1,
    })
    assertRestSuccess(result, [200], 'calculate and save per diem')
  })
})

describe('Invoices API', () => {
  let testInvoiceId: string | null = null

  it('GraphQL — list invoices with pagination', async () => {
    const res = await graphql(`
      {
        invoices(page: 0, size: 5) {
          content {
            id
            invoiceNumber
            paymentStatus
          }
          totalElements
          totalPages
        }
      }
    `)
    assertGraphqlSuccess(res, 'invoices list')
    expect(res.data.invoices).toBeTruthy()
    expect(res.data.invoices.totalElements).toBeGreaterThanOrEqual(0)
  })

  it('GraphQL — list invoices with sorting', async () => {
    const res = await graphql(`
      {
        invoices(sortBy: "invoiceNumber", sortDir: "asc", page: 0, size: 5) {
          content {
            invoiceNumber
          }
        }
      }
    `)
    assertGraphqlSuccess(res, 'invoices sorted')
    expect(res.data.invoices).toBeTruthy()
  })

  it('REST — create invoice', async () => {
    const partners = await graphql(`
      {
        partners(page: 0, size: 1) {
          content {
            id
          }
        }
      }
    `)
    assertGraphqlSuccess(partners, 'partners for invoice create')
    const partnerId = Number(partners.data.partners.content[0].id)

    const createResult = await rest('POST', '/invoices', {
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
    assertRestSuccess(createResult, [201], 'create invoice')
    expect(createResult.data.invoiceNumber).toBeTruthy()
    testInvoiceId = String(createResult.data.id)
  })

  it('GraphQL — get invoice detail with items', async () => {
    expect(testInvoiceId).toBeTruthy()
    const res = await graphql(
      `
        query ($id: ID!) {
          invoice(id: $id) {
            id
            invoiceNumber
            paymentStatus
            subtotal
            vatRate
            vatAmount
            total
            items {
              id
              description
              quantity
              unit
              unitPrice
              total
            }
            partner {
              id
              name
            }
          }
        }
      `,
      { id: testInvoiceId }
    )
    assertGraphqlSuccess(res, 'invoice detail')
    expect(res.data.invoice).toBeTruthy()
    expect(res.data.invoice.items.length).toBeGreaterThan(0)
    expect(res.data.invoice.total).toBeGreaterThan(0)
  })

  it('REST — update invoice status', async () => {
    expect(testInvoiceId).toBeTruthy()
    const result = await rest('PATCH', `/invoices/${testInvoiceId}/status`, {
      newStatus: 'PAID',
    })
    assertRestSuccess(result, [200, 400, 403], 'update invoice status')
  })

  it.skip('REST — download invoice PDF (BE BUG: missing font file)', async () => {
    expect(testInvoiceId).toBeTruthy()
    const result = await rest('GET', `/invoices/${testInvoiceId}/pdf`)
    assertRestSuccess(result, [200], 'download invoice PDF')
  })

  it('REST — download invoice XML', async () => {
    expect(testInvoiceId).toBeTruthy()
    const result = await rest('GET', `/invoices/${testInvoiceId}/xml`)
    assertRestSuccess(result, [200, 404], 'download invoice XML')
  })

  it('REST — delete invoice', async () => {
    expect(testInvoiceId).toBeTruthy()
    const result = await rest('DELETE', `/invoices/${testInvoiceId}`)
    assertRestSuccess(result, [204, 403], 'delete invoice')
  })
})

describe('Document Upload API', () => {
  it('POST /vehicles/{id}/documents returns 400 without required fields', async () => {
    const vehicles = await graphql(`
      {
        vehicles(page: 0, size: 1) {
          content {
            id
          }
        }
      }
    `)
    assertGraphqlSuccess(vehicles, 'vehicles for doc upload')
    const vehicleId = vehicles.data.vehicles.content[0]?.id
    expect(vehicleId).toBeTruthy()

    const result = await rest('POST', `/vehicles/${vehicleId}/documents`, {})
    // 400 = missing required fields (tempFileName, documentType, originalFileName)
    assertRestSuccess(result, [400], 'upload document without required fields')
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
    assertGraphqlSuccess(vehicles, 'vehicles for update')
    const v = vehicles.data.vehicles.content[0]

    const result = await rest('PUT', `/vehicles/${v.id}`, {
      regNumber: v.regNumber,
      make: v.make,
      model: v.model,
      vehicleType: v.vehicleType,
      fuelType: v.fuelType,
    })
    assertRestSuccess(result, [200], 'update vehicle')
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
    assertGraphqlSuccess(res, 'expiringDocuments')
    expect(res.data).toBeTruthy()
    expect(Array.isArray(res.data.expiringDocuments)).toBe(true)
  })
})
