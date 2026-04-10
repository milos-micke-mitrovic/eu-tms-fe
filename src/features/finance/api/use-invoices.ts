import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import type { GetInvoicesQuery, GetInvoiceQuery } from '@/generated/graphql'
import type { InvoiceFilter } from '../types'

export const GET_INVOICES = gql`
  query GetInvoices(
    $status: String
    $partnerId: ID
    $dateFrom: Date
    $dateTo: Date
    $search: String
    $sortBy: String
    $sortDir: String
    $page: Int
    $size: Int
  ) {
    invoices(
      status: $status
      partnerId: $partnerId
      dateFrom: $dateFrom
      dateTo: $dateTo
      search: $search
      sortBy: $sortBy
      sortDir: $sortDir
      page: $page
      size: $size
    ) {
      content {
        id
        invoiceNumber
        paymentStatus
        partner {
          id
          name
          pib
        }
        invoiceDate
        dueDate
        currency
        total
      }
      totalElements
      totalPages
      number
      size
    }
  }
`

export const GET_INVOICE = gql`
  query GetInvoice($id: ID!) {
    invoice(id: $id) {
      id
      invoiceNumber
      partnerId
      partner {
        id
        name
        pib
        city
        address
      }
      invoiceDate
      dueDate
      currency
      subtotal
      vatRate
      vatAmount
      total
      paymentStatus
      items {
        id
        description
        quantity
        unit
        unitPrice
        total
      }
      relatedRouteIds
      notes
      createdAt
    }
  }
`

export function useInvoices(filter: InvoiceFilter) {
  return useQuery<GetInvoicesQuery>(GET_INVOICES, { variables: filter })
}

export function useInvoice(id: string | null) {
  return useQuery<GetInvoiceQuery>(GET_INVOICE, {
    variables: { id },
    skip: !id,
  })
}
