import { describe, it, expect } from 'vitest'
import { rest, graphql } from './helpers'

describe('Partners API', () => {
  it('GraphQL — list partners with search', async () => {
    const res = await graphql(`{
      partners(search: "Delta", page: 0, size: 10) {
        content { id name pib city partnerType }
        totalElements
      }
    }`)
    expect(res.data.partners.content.length).toBeGreaterThan(0)
    expect(res.data.partners.content[0].name).toContain('Delta')
  })

  it('GraphQL — filter by partnerType', async () => {
    const res = await graphql(`{
      partners(partnerType: "CLIENT", page: 0, size: 10) {
        content { partnerType }
      }
    }`)
    for (const p of res.data.partners.content) {
      expect(p.partnerType).toBe('CLIENT')
    }
  })

  it('GraphQL — sorting', async () => {
    const res = await graphql(`{
      partners(sortBy: "name", sortDir: "asc", page: 0, size: 50) {
        content { name }
      }
    }`)
    const names = res.data.partners.content.map((p: { name: string }) => p.name)
    expect(names).toEqual([...names].sort())
  })

  it('REST — CRUD partner', async () => {
    const { status, data } = await rest('POST', '/partners', {
      name: 'Test Partner', partnerType: 'CLIENT',
    })
    expect(status).toBe(201)
    expect(data.name).toBe('Test Partner')

    const { status: updateStatus, data: updated } = await rest('PUT', `/partners/${data.id}`, {
      name: 'Updated Partner', partnerType: 'SUPPLIER',
    })
    expect(updateStatus).toBe(200)
    expect(updated.partnerType).toBe('SUPPLIER')

    const { status: delStatus } = await rest('DELETE', `/partners/${data.id}`)
    expect(delStatus).toBe(204)
  })
})
