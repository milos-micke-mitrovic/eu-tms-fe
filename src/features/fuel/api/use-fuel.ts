import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { httpClient } from '@/shared/api/http-client'
import type { FuelTank, FuelTankRequest, FuelTransaction, FuelTransactionRequest } from '../types'

// PARTIAL: BE Sprint 3 — hooks ready, REST endpoints not yet in BE

const fuelKeys = {
  all: ['fuel'] as const,
  tanks: () => [...fuelKeys.all, 'tanks'] as const,
  transactions: (page: number, size: number) => [...fuelKeys.all, 'transactions', page, size] as const,
}

export function useFuelTanks() {
  return useQuery({
    queryKey: fuelKeys.tanks(),
    queryFn: () => httpClient.get<FuelTank[]>('/fuel-tanks'),
    retry: false, // BE Sprint 3 — endpoint doesn't exist yet
  })
}

export function useCreateFuelTank() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: FuelTankRequest) =>
      httpClient.post<FuelTank>('/fuel-tanks', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fuelKeys.tanks() })
      toast.success(t('common:success.created'))
    },
  })
}

export function useCreateFuelTransaction() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: FuelTransactionRequest) =>
      httpClient.post<FuelTransaction>('/fuel-tanks/transactions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fuelKeys.all })
      toast.success(t('common:success.created'))
    },
  })
}
