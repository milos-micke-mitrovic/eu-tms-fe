import { describe, it, expect } from 'vitest'
import { GET_ROUTES } from './use-routes'
import { GET_ROUTE } from './use-route-detail'
import { GET_EXPENSE_SUMMARY } from './use-expenses'

describe('GraphQL queries - Spedition', () => {
  it('GET_ROUTES query has required fields', () => {
    const query = GET_ROUTES.loc?.source.body ?? ''
    expect(query).toContain('query GetRoutes')
    expect(query).toContain('$sortBy: String')
    expect(query).toContain('$sortDir: String')
    expect(query).toContain('$page: Int')
    expect(query).toContain('internalNumber')
    expect(query).toContain('totalElements')
    expect(query).toContain('totalPages')
  })

  it('GET_ROUTE detail query has nested data', () => {
    const query = GET_ROUTE.loc?.source.body ?? ''
    expect(query).toContain('query GetRoute')
    expect(query).toContain('partner {')
    expect(query).toContain('vehicle {')
    expect(query).toContain('driver {')
    expect(query).toContain('stops {')
    expect(query).toContain('expenses {')
    expect(query).toContain('totalExpenseRsd')
    expect(query).toContain('profit')
  })

  it('GET_EXPENSE_SUMMARY has required params', () => {
    const query = GET_EXPENSE_SUMMARY.loc?.source.body ?? ''
    expect(query).toContain('$from: Date!')
    expect(query).toContain('$to: Date!')
    expect(query).toContain('$groupBy: String!')
    expect(query).toContain('totalAmountRsd')
  })
})
