import { describe, it, expect } from 'vitest'
import { rest, graphql } from './helpers'
import { assertRestSuccess, assertGraphqlSuccess } from './assert-helpers'

describe('Notifications API', () => {
  it('REST — list notifications', async () => {
    const result = await rest('GET', '/notifications?page=0&size=10')
    assertRestSuccess(result, [200], 'list notifications')
    expect(Array.isArray(result.data.content)).toBe(true)
    expect(result.data.totalElements).toBeGreaterThanOrEqual(0)
  })

  it('REST — mark all as read', async () => {
    const result = await rest('PATCH', '/notifications/read-all')
    assertRestSuccess(result, [200, 204], 'mark all notifications read')
  })

  it('REST — mark single as read', async () => {
    const listResult = await rest('GET', '/notifications?page=0&size=1')
    assertRestSuccess(listResult, [200], 'list notifications for mark-read')
    if (!listResult.data?.content?.length) return // no notifications to mark

    const id = listResult.data.content[0].id
    const result = await rest('PATCH', `/notifications/${id}/read`)
    assertRestSuccess(result, [200, 204], 'mark notification read')
  })

  it('REST — delete notification', async () => {
    const listResult = await rest('GET', '/notifications?page=0&size=1')
    assertRestSuccess(listResult, [200], 'list notifications for delete')
    if (!listResult.data?.content?.length) return // no notifications to delete

    const id = listResult.data.content[0].id
    const result = await rest('DELETE', `/notifications/${id}`)
    assertRestSuccess(result, [200, 204], 'delete notification')
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
    assertGraphqlSuccess(res, 'expiringDocuments')
    expect(Array.isArray(res.data.expiringDocuments)).toBe(true)
  })
})
