import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { httpClient } from '@/shared/api/http-client'
import { apolloClient } from '@/shared/api/apollo-client'
import type { PartnerRequest } from '../types'

export function useCreatePartner() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (data: PartnerRequest) => httpClient.post('/partners', data),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: ['GetPartners'] })
      toast.success(t('common:success.created'))
    },
  })
}

export function useUpdatePartner() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PartnerRequest }) =>
      httpClient.put(`/partners/${id}`, data),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: ['GetPartners'] })
      toast.success(t('common:success.saved'))
    },
  })
}

export function useDeletePartner() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => httpClient.delete(`/partners/${id}`),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: ['GetPartners'] })
      toast.success(t('common:success.deleted'))
    },
  })
}
