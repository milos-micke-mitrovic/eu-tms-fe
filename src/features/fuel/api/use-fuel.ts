import { gql } from '@apollo/client'
import { useQuery as useApolloQuery } from '@apollo/client/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { httpClient } from '@/shared/api/http-client'
import { apolloClient } from '@/shared/api/apollo-client'
import type { GetFuelTanksQuery } from '@/generated/graphql'
import type {
  FuelTank,
  FuelTankRequest,
  FuelTransaction,
  FuelTransactionRequest,
} from '../types'

// GraphQL for reading tanks
export const GET_FUEL_TANKS = gql`
  query GetFuelTanks {
    fuelTanks {
      id
      name
      capacityLiters
      currentLevelLiters
      fuelType
      location
      percentFull
    }
  }
`

export function useFuelTanks() {
  return useApolloQuery<GetFuelTanksQuery>(GET_FUEL_TANKS)
}

// REST for transactions (simple list, no GraphQL needed)
const fuelKeys = {
  all: ['fuel'] as const,
  transactions: (tankId?: number) =>
    [...fuelKeys.all, 'transactions', tankId] as const,
}

export function useFuelTransactions(tankId?: number) {
  return useQuery({
    queryKey: fuelKeys.transactions(tankId),
    queryFn: () => {
      const url = tankId
        ? `/fuel-tanks/${tankId}/transactions`
        : '/fuel-tanks/transactions'
      return httpClient.get<FuelTransaction[]>(url)
    },
    enabled: tankId !== undefined,
  })
}

// REST mutations
export function useCreateFuelTank() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (data: FuelTankRequest) =>
      httpClient.post<FuelTank>('/fuel-tanks', data),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: ['GetFuelTanks'] })
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
      apolloClient.refetchQueries({ include: ['GetFuelTanks'] })
      queryClient.invalidateQueries({ queryKey: fuelKeys.all })
      toast.success(t('common:success.created'))
    },
  })
}
