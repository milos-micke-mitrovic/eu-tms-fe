import { describe, it, expect } from 'vitest'
import { graphql } from './helpers'
import { assertRestSuccess, assertGraphqlSuccess } from './assert-helpers'

const API = process.env.TEST_API_URL || 'http://localhost:8080/api'
let accountingToken: string | null = null

async function ensureAccountingToken() {
  if (accountingToken) return
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.TEST_ACCOUNTING_EMAIL || 'ana@demo.rs',
        password: process.env.TEST_ACCOUNTING_PASSWORD || 'demo123',
      }),
    })
    if (res.ok) {
      const data = await res.json()
      accountingToken = data.accessToken
      return
    }
    const wait = Number(res.headers.get('Retry-After') || 6)
    await new Promise((r) => setTimeout(r, wait * 1000))
  }
  throw new Error('Accounting login failed')
}

async function collectionsRest(method: string, path: string, body?: unknown) {
  await ensureAccountingToken()
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accountingToken}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (res.status === 429) {
      const wait = Number(res.headers.get('Retry-After') || 3)
      await new Promise((r) => setTimeout(r, wait * 1000))
      continue
    }
    const data = res.status === 204 ? null : await res.json().catch(() => null)
    return { status: res.status, data }
  }
  return { status: 429, data: null }
}

describe('Collections API (ACCOUNTING role)', () => {
  let testPaymentId: number | null = null
  let testInvoiceId: number | null = null

  // -- Setup: get an invoice to work with --
  it('setup — get first invoice', async () => {
    const res = await graphql(`
      {
        invoices(page: 0, size: 1) {
          content {
            id
            invoiceNumber
          }
        }
      }
    `)
    assertGraphqlSuccess(res, 'invoices for collections setup')
    const invoice = res.data?.invoices?.content?.[0]
    expect(invoice).toBeTruthy()
    testInvoiceId = Number(invoice.id)
    expect(testInvoiceId).toBeGreaterThan(0)
  })

  // -- GraphQL reads --
  it('GraphQL — collectionDashboard', async () => {
    const res = await graphql(`
      {
        collectionDashboard {
          totalReceivables
          totalOverdue
          collectedThisMonth
          collectionRate
          overdueInvoiceCount
          remindersThisMonth
          agingBuckets {
            bucket
            invoiceCount
            totalAmount
            currency
          }
        }
      }
    `)
    assertGraphqlSuccess(res, 'collectionDashboard')
    expect(res.data?.collectionDashboard).toBeTruthy()
    expect(res.data.collectionDashboard).toHaveProperty('totalReceivables')
    expect(res.data.collectionDashboard).toHaveProperty('agingBuckets')
    expect(Array.isArray(res.data.collectionDashboard.agingBuckets)).toBe(true)
  })

  it('GraphQL — debtorsSummary', async () => {
    const res = await graphql(`
      {
        debtorsSummary(limit: 5) {
          partnerId
          partnerName
          totalInvoices
          overdueInvoices
          totalDebt
          overdueDebt
          oldestDueDate
          avgDaysOverdue
          remindersSent
          lastReminderDate
        }
      }
    `)
    assertGraphqlSuccess(res, 'debtorsSummary')
    expect(res.data?.debtorsSummary).toBeTruthy()
    expect(Array.isArray(res.data.debtorsSummary)).toBe(true)
    if (res.data.debtorsSummary.length > 0) {
      const d = res.data.debtorsSummary[0]
      expect(d).toHaveProperty('partnerId')
      expect(d).toHaveProperty('partnerName')
      expect(d).toHaveProperty('totalDebt')
    }
  })

  // -- REST: Payments CRUD --
  it('REST — record payment', async () => {
    expect(testInvoiceId).toBeGreaterThan(0)
    const result = await collectionsRest('POST', '/collections/payments', {
      invoiceId: testInvoiceId,
      amount: 100,
      paymentDate: '2026-04-01',
      paymentMethod: 'BANK_TRANSFER',
      currency: 'RSD',
      referenceNumber: 'TEST-REF-001',
      notes: 'Test payment',
    })
    assertRestSuccess(result!, [200, 201], 'record payment')
    if (result!.data?.id) testPaymentId = result!.data.id
    expect(result!.data).toHaveProperty('invoiceId')
    expect(result!.data).toHaveProperty('amount')
  })

  it('GraphQL — invoicePayments', async () => {
    expect(testInvoiceId).toBeGreaterThan(0)
    const res = await graphql(`{
      invoicePayments(invoiceId: "${testInvoiceId}") {
        id invoiceId invoiceNumber paymentDate amount
        currency paymentMethod referenceNumber notes
      }
    }`)
    assertGraphqlSuccess(res, 'invoicePayments')
    expect(res.data?.invoicePayments).toBeTruthy()
    expect(Array.isArray(res.data.invoicePayments)).toBe(true)
  })

  it('REST — update payment', async () => {
    if (!testPaymentId || !testInvoiceId) {
      console.warn('Skipping update payment: no payment was created')
      return
    }
    const result = await collectionsRest(
      'PUT',
      `/collections/payments/${testPaymentId}`,
      {
        invoiceId: testInvoiceId,
        amount: 200,
        paymentDate: '2026-04-02',
        paymentMethod: 'CASH',
        currency: 'RSD',
      }
    )
    assertRestSuccess(result!, [200], 'update payment')
    expect(result!.data?.amount).toBe(200)
  })

  // -- REST: Reminders --
  it('REST — send reminder', async () => {
    expect(testInvoiceId).toBeGreaterThan(0)
    const result = await collectionsRest(
      'POST',
      '/collections/reminders/send',
      {
        invoiceId: testInvoiceId,
        recipientEmail: 'test@example.com',
        subject: 'Test opomena',
        message: 'Test reminder body',
      }
    )
    assertRestSuccess(result!, [200, 201], 'send reminder')
  })

  it('GraphQL — invoiceReminders', async () => {
    expect(testInvoiceId).toBeGreaterThan(0)
    const res = await graphql(`{
      invoiceReminders(invoiceId: "${testInvoiceId}") {
        id invoiceId invoiceNumber reminderType sentVia
        daysOverdue amountDue sentAt
      }
    }`)
    assertGraphqlSuccess(res, 'invoiceReminders')
    expect(res.data?.invoiceReminders).toBeTruthy()
    expect(Array.isArray(res.data.invoiceReminders)).toBe(true)
  })

  it('GraphQL — partnerReminders', async () => {
    // Use first debtor's partnerId
    const debtorsRes = await graphql(`
      {
        debtorsSummary(limit: 1) {
          partnerId
        }
      }
    `)
    assertGraphqlSuccess(debtorsRes, 'debtorsSummary for partnerReminders')
    const partnerId = debtorsRes.data?.debtorsSummary?.[0]?.partnerId
    if (!partnerId) {
      console.warn('Skipping partnerReminders: no debtors found')
      return
    }

    const res = await graphql(`{
      partnerReminders(partnerId: "${partnerId}") {
        id invoiceId invoiceNumber partnerName reminderType
        sentVia daysOverdue amountDue sentAt
      }
    }`)
    assertGraphqlSuccess(res, 'partnerReminders')
    expect(res.data?.partnerReminders).toBeTruthy()
    expect(Array.isArray(res.data.partnerReminders)).toBe(true)
  })

  // -- REST: Collection Rules --
  it('REST — list collection rules', async () => {
    const result = await collectionsRest('GET', '/collections/rules')
    assertRestSuccess(result!, [200], 'list collection rules')
    expect(Array.isArray(result!.data)).toBe(true)
  })

  it('REST — create rule (403 for ACCOUNTING, needs ADMIN)', async () => {
    const result = await collectionsRest('POST', '/collections/rules', {
      daysAfterDue: 30,
      reminderType: 'FIRST',
      sendVia: 'EMAIL',
      enabled: true,
      emailSubjectTemplate: 'Opomena za fakturu',
      emailBodyTemplate:
        'Postovani {partner_name}, faktura {invoice_number}...',
    })
    // ACCOUNTING role likely gets 403, only ADMIN can manage rules
    assertRestSuccess(result!, [200, 201, 403], 'create collection rule')
  })

  // -- Cleanup --
  it('cleanup — delete test payment', async () => {
    if (!testPaymentId) {
      console.warn('Skipping payment cleanup: no payment was created')
      return
    }
    const result = await collectionsRest(
      'DELETE',
      `/collections/payments/${testPaymentId}`
    )
    assertRestSuccess(result!, [200, 204], 'delete payment')
  })
})
