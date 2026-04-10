import { describe, it, expect } from 'vitest'
import { GET_INVOICES, GET_INVOICE } from './use-invoices'
import { GET_EXCHANGE_RATES } from './use-exchange-rates'
import { GET_PER_DIEM_RATES } from './use-per-diem'

describe('GraphQL queries - Finance', () => {
  it('GET_INVOICES has sorting + pagination + filters', () => {
    const query = GET_INVOICES.loc?.source.body ?? ''
    expect(query).toContain('query GetInvoices')
    expect(query).toContain('$status: String')
    expect(query).toContain('$sortBy: String')
    expect(query).toContain('invoiceNumber')
    expect(query).toContain('paymentStatus')
    expect(query).toContain('totalElements')
  })

  it('GET_INVOICE has items and partner details', () => {
    const query = GET_INVOICE.loc?.source.body ?? ''
    expect(query).toContain('query GetInvoice')
    expect(query).toContain('partner {')
    expect(query).toContain('items {')
    expect(query).toContain('subtotal')
    expect(query).toContain('vatRate')
    expect(query).toContain('vatAmount')
    expect(query).toContain('total')
    expect(query).toContain('paymentStatus')
  })

  it('GET_EXCHANGE_RATES has required fields', () => {
    const query = GET_EXCHANGE_RATES.loc?.source.body ?? ''
    expect(query).toContain('exchangeRates')
    expect(query).toContain('currencyCode')
    expect(query).toContain('rateToRsd')
  })

  it('GET_PER_DIEM_RATES has required fields', () => {
    const query = GET_PER_DIEM_RATES.loc?.source.body ?? ''
    expect(query).toContain('perDiemRates')
    expect(query).toContain('countryCode')
    expect(query).toContain('dailyAmount')
  })
})
