import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { httpClient } from '@/shared/api/http-client'
import { apolloClient } from '@/shared/api/apollo-client'
import type { Route, RouteRequest } from '../types'

export function useCreateRoute() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (data: RouteRequest) =>
      httpClient.post<Route>('/routes', data),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: ['GetRoutes'] })
      toast.success(t('common:success.created'))
    },
  })
}

export function useUpdateRoute() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RouteRequest }) =>
      httpClient.put<Route>(`/routes/${id}`, data),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: ['GetRoutes', 'GetRoute'] })
      toast.success(t('common:success.saved'))
    },
  })
}

export function useUpdateRouteStatus() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, newStatus }: { id: number; newStatus: string }) =>
      httpClient.patch<Route>(`/routes/${id}/status`, { newStatus }),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: ['GetRoutes', 'GetRoute'] })
      toast.success(t('common:success.saved'))
    },
  })
}

export function useDeleteRoute() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: number) => httpClient.delete(`/routes/${id}`),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: ['GetRoutes'] })
      toast.success(t('common:success.deleted'))
    },
  })
}
