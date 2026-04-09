import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { httpClient } from '@/shared/api/http-client'
import { apolloClient } from '@/shared/api/apollo-client'
import type { Vehicle, VehicleRequest } from '../types'

export function useCreateVehicle() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (data: VehicleRequest) =>
      httpClient.post<Vehicle>('/vehicles', data),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: ['GetVehicles'] })
      toast.success(t('common:success.created'))
    },
  })
}

export function useUpdateVehicle() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: VehicleRequest }) =>
      httpClient.put<Vehicle>(`/vehicles/${id}`, data),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: ['GetVehicles', 'GetVehicle'] })
      toast.success(t('common:success.saved'))
    },
  })
}

export function useDeleteVehicle() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: number) => httpClient.delete(`/vehicles/${id}`),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: ['GetVehicles'] })
      toast.success(t('common:success.deleted'))
    },
  })
}
