import { useQuery } from '@apollo/client/react'
import {
  useQuery as useTanstackQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { httpClient } from '@/shared/api/http-client'
import { apolloClient } from '@/shared/api/apollo-client'
import type {
  GetCollectionDashboardQuery,
  GetDebtorsSummaryQuery,
  GetInvoicePaymentsQuery,
  GetInvoiceRemindersQuery,
  GetPartnerRemindersQuery,
} from '@/generated/graphql'
import type {
  InvoicePayment,
  InvoicePaymentRequest,
  SendReminderRequest,
  CollectionRule,
  CollectionRuleRequest,
} from '../types'
import {
  GET_COLLECTION_DASHBOARD,
  GET_DEBTORS_SUMMARY,
  GET_INVOICE_PAYMENTS,
  GET_INVOICE_REMINDERS,
  GET_PARTNER_REMINDERS,
} from './collections.queries'

// ── GraphQL reads ──────────────────────────

export function useCollectionDashboard() {
  return useQuery<GetCollectionDashboardQuery>(GET_COLLECTION_DASHBOARD)
}

export function useDebtorsSummary(limit = 10) {
  return useQuery<GetDebtorsSummaryQuery>(GET_DEBTORS_SUMMARY, {
    variables: { limit },
  })
}

export function useInvoicePayments(invoiceId: string | null) {
  return useQuery<GetInvoicePaymentsQuery>(GET_INVOICE_PAYMENTS, {
    variables: { invoiceId: String(invoiceId) },
    skip: !invoiceId,
  })
}

export function useInvoiceReminders(invoiceId: string | null) {
  return useQuery<GetInvoiceRemindersQuery>(GET_INVOICE_REMINDERS, {
    variables: { invoiceId: String(invoiceId) },
    skip: !invoiceId,
  })
}

export function usePartnerReminders(partnerId: string | null) {
  return useQuery<GetPartnerRemindersQuery>(GET_PARTNER_REMINDERS, {
    variables: { partnerId: String(partnerId) },
    skip: !partnerId,
  })
}

// ── REST reads (TanStack Query) ────────────

export function useCollectionRules() {
  return useTanstackQuery({
    queryKey: ['collection-rules'],
    queryFn: () => httpClient.get<CollectionRule[]>('/collections/rules'),
  })
}

// ── REST mutations ─────────────────────────

const REFETCH_QUERIES = [
  'GetCollectionDashboard',
  'GetDebtorsSummary',
  'GetInvoicePayments',
]

export function useRecordPayment() {
  return useMutation({
    mutationFn: (data: InvoicePaymentRequest) =>
      httpClient.post<InvoicePayment>('/collections/payments', data),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: REFETCH_QUERIES })
      toast.success('Uplata zabeležena')
    },
  })
}

export function useUpdatePayment() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: InvoicePaymentRequest }) =>
      httpClient.put<InvoicePayment>(`/collections/payments/${id}`, data),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: REFETCH_QUERIES })
      toast.success('Uplata ažurirana')
    },
  })
}

export function useDeletePayment() {
  return useMutation({
    mutationFn: (id: number) =>
      httpClient.delete(`/collections/payments/${id}`),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: REFETCH_QUERIES })
      toast.success('Uplata obrisana')
    },
  })
}

export function useSendReminder() {
  return useMutation({
    mutationFn: (data: SendReminderRequest) =>
      httpClient.post('/collections/reminders', data),
    onSuccess: () => {
      apolloClient.refetchQueries({
        include: [
          'GetCollectionDashboard',
          'GetDebtorsSummary',
          'GetInvoiceReminders',
          'GetPartnerReminders',
        ],
      })
      toast.success('Opomena poslata')
    },
  })
}

export function useCreateRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CollectionRuleRequest) =>
      httpClient.post<CollectionRule>('/collections/rules', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection-rules'] })
      toast.success('Pravilo kreirano')
    },
  })
}

export function useUpdateRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CollectionRuleRequest }) =>
      httpClient.put<CollectionRule>(`/collections/rules/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection-rules'] })
      toast.success('Pravilo ažurirano')
    },
  })
}

export function useDeleteRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => httpClient.delete(`/collections/rules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection-rules'] })
      toast.success('Pravilo obrisano')
    },
  })
}
