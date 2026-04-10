import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { httpClient } from '@/shared/api/http-client'
import { apolloClient } from '@/shared/api/apollo-client'
import type { RouteRequest } from '../types'

export function useCreateRoute() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (data: RouteRequest) => httpClient.post('/routes', data),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: ['GetRoutes'] })
      toast.success(t('common:success.created'))
    },
  })
}

export function useUpdateRoute() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RouteRequest }) =>
      httpClient.put(`/routes/${id}`, data),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: ['GetRoutes', 'GetRoute'] })
      toast.success(t('common:success.saved'))
    },
  })
}

export function useUpdateRouteStatus() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, newStatus }: { id: string; newStatus: string }) =>
      httpClient.patch(`/routes/${id}/status`, { newStatus }),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: ['GetRoutes', 'GetRoute'] })
      toast.success(t('common:success.saved'))
    },
  })
}

export function useDeleteRoute() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => httpClient.delete(`/routes/${id}`),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: ['GetRoutes'] })
      toast.success(t('common:success.deleted'))
    },
  })
}
