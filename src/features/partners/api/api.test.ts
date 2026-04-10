import { describe, it, expect } from 'vitest'
import { GET_PARTNERS } from './use-partners'

describe('GraphQL queries - Partners', () => {
  it('GET_PARTNERS has sorting + pagination + filters', () => {
    const query = GET_PARTNERS.loc?.source.body ?? ''
    expect(query).toContain('query GetPartners')
    expect(query).toContain('$search: String')
    expect(query).toContain('$partnerType: String')
    expect(query).toContain('$sortBy: String')
    expect(query).toContain('$sortDir: String')
    expect(query).toContain('name')
    expect(query).toContain('pib')
    expect(query).toContain('partnerType')
    expect(query).toContain('totalElements')
    expect(query).toContain('totalPages')
  })
})
