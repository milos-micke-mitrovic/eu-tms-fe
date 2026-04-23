import { describe, it, expect } from 'vitest'
import { rest, graphql } from './helpers'
import { assertRestSuccess, assertGraphqlSuccess } from './assert-helpers'

describe('Partners API', () => {
  it('GraphQL — list partners with search', async () => {
    const res = await graphql(`
      {
        partners(search: "Delta", page: 0, size: 10) {
          content {
            id
            name
            pib
            city
            partnerType
          }
          totalElements
        }
      }
    `)
    assertGraphqlSuccess(res, 'partners search')
    expect(res.data.partners.content.length).toBeGreaterThan(0)
    expect(res.data.partners.content[0].name).toContain('Delta')
  })

  it('GraphQL — filter by partnerType', async () => {
    const res = await graphql(`
      {
        partners(partnerType: "CLIENT", page: 0, size: 10) {
          content {
            partnerType
          }
        }
      }
    `)
    assertGraphqlSuccess(res, 'partners filter by type')
    for (const p of res.data.partners.content) {
      expect(p.partnerType).toBe('CLIENT')
    }
  })

  it('GraphQL — sorting', async () => {
    const res = await graphql(`
      {
        partners(sortBy: "name", sortDir: "asc", page: 0, size: 50) {
          content {
            name
          }
        }
      }
    `)
    assertGraphqlSuccess(res, 'partners sorted')
    const names = res.data.partners.content.map((p: { name: string }) => p.name)
    expect(names).toEqual([...names].sort())
  })

  it('REST — CRUD partner', async () => {
    const createResult = await rest('POST', '/partners', {
      name: 'Test Partner',
      partnerType: 'CLIENT',
    })
    assertRestSuccess(createResult, [201], 'create partner')
    expect(createResult.data.name).toBe('Test Partner')

    const updateResult = await rest(
      'PUT',
      `/partners/${createResult.data.id}`,
      {
        name: 'Updated Partner',
        partnerType: 'SUPPLIER',
      }
    )
    assertRestSuccess(updateResult, [200], 'update partner')
    expect(updateResult.data.partnerType).toBe('SUPPLIER')

    const deleteResult = await rest(
      'DELETE',
      `/partners/${createResult.data.id}`
    )
    assertRestSuccess(deleteResult, [204], 'delete partner')
  })
})
