import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { httpClient } from '@/shared/api/http-client'
import { apolloClient } from '@/shared/api/apollo-client'
import type { Trailer, TrailerRequest } from '../types'

export function useCreateTrailer() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (data: TrailerRequest) =>
      httpClient.post<Trailer>('/trailers', data),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: ['GetTrailers'] })
      toast.success(t('common:success.created'))
    },
  })
}

export function useUpdateTrailer() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TrailerRequest }) =>
      httpClient.put<Trailer>(`/trailers/${id}`, data),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: ['GetTrailers'] })
      toast.success(t('common:success.saved'))
    },
  })
}

export function useDeleteTrailer() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: number) => httpClient.delete(`/trailers/${id}`),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: ['GetTrailers'] })
      toast.success(t('common:success.deleted'))
    },
  })
}
