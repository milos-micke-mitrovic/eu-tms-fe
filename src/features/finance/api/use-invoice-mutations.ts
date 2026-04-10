import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { httpClient } from '@/shared/api/http-client'
import { apolloClient } from '@/shared/api/apollo-client'
import type { InvoiceRequest } from '../types'

export function useCreateInvoice() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (data: InvoiceRequest) => httpClient.post('/invoices', data),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: ['GetInvoices'] })
      toast.success(t('common:success.created'))
    },
  })
}

export function useUpdateInvoice() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: InvoiceRequest }) =>
      httpClient.put(`/invoices/${id}`, data),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: ['GetInvoices', 'GetInvoice'] })
      toast.success(t('common:success.saved'))
    },
  })
}

export function useDeleteInvoice() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => httpClient.delete(`/invoices/${id}`),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: ['GetInvoices'] })
      toast.success(t('common:success.deleted'))
    },
  })
}

export function useUpdateInvoiceStatus() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      httpClient.patch(`/invoices/${id}/status`, { status }),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: ['GetInvoices', 'GetInvoice'] })
      toast.success(t('common:success.saved'))
    },
  })
}
