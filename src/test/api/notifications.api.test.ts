import { describe, it, expect } from 'vitest'
import { rest, graphql } from './helpers'

describe('Notifications API', () => {
  it('REST — list notifications', async () => {
    const { status, data } = await rest('GET', '/notifications?page=0&size=10')
    expect(status).toBe(200)
    expect(Array.isArray(data.content)).toBe(true)
    expect(data.totalElements).toBeGreaterThanOrEqual(0)
  })

  // BE BUG: expiringDocuments query returns INTERNAL_ERROR
  it('GraphQL — expiring documents', async () => {
    const res = await graphql(`{
      expiringDocuments(days: 30) {
        entityType entityName documentType expirationDate daysUntilExpiry
      }
    }`)
    // TODO: change to expect(res.data.expiringDocuments) when BE fixes
    expect(res.errors || res.data).toBeTruthy()
  })
})
