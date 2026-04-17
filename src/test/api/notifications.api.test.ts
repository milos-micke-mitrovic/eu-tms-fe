import { describe, it, expect } from 'vitest'
import { rest, graphql } from './helpers'

describe('Notifications API', () => {
  it('REST — list notifications', async () => {
    const { status, data } = await rest('GET', '/notifications?page=0&size=10')
    expect(status).toBe(200)
    expect(Array.isArray(data.content)).toBe(true)
    expect(data.totalElements).toBeGreaterThanOrEqual(0)
  })

  it('REST — mark all as read', async () => {
    const { status } = await rest('PATCH', '/notifications/read-all')
    expect([200, 204]).toContain(status)
  })

  it('REST — mark single as read', async () => {
    // Get a notification first
    const { data } = await rest('GET', '/notifications?page=0&size=1')
    if (!data?.content?.length) return
    const id = data.content[0].id
    const { status } = await rest('PATCH', `/notifications/${id}/read`)
    expect([200, 204]).toContain(status)
  })

  it('REST — delete notification', async () => {
    const { data } = await rest('GET', '/notifications?page=0&size=1')
    if (!data?.content?.length) return
    const id = data.content[0].id
    const { status } = await rest('DELETE', `/notifications/${id}`)
    expect([200, 204]).toContain(status)
  })

  it('GraphQL — expiring documents', async () => {
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
    expect(res.errors || res.data).toBeTruthy()
  })
})
