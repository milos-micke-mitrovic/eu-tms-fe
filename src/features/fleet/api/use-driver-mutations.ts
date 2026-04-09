import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { httpClient } from '@/shared/api/http-client'
import { apolloClient } from '@/shared/api/apollo-client'
import type { Driver, DriverRequest } from '../types'

export function useCreateDriver() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (data: DriverRequest) =>
      httpClient.post<Driver>('/drivers', data),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: ['GetDrivers'] })
      toast.success(t('common:success.created'))
    },
  })
}

export function useUpdateDriver() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DriverRequest }) =>
      httpClient.put<Driver>(`/drivers/${id}`, data),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: ['GetDrivers', 'GetDriver'] })
      toast.success(t('common:success.saved'))
    },
  })
}

export function useDeleteDriver() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: number) => httpClient.delete(`/drivers/${id}`),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: ['GetDrivers'] })
      toast.success(t('common:success.deleted'))
    },
  })
}
