import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { httpClient } from '@/shared/api/http-client'
import { apolloClient } from '@/shared/api/apollo-client'
import type { GetPerDiemRatesQuery } from '@/generated/graphql'
import type {
  PerDiemCalculationRequest,
  PerDiemCalculationResponse,
} from '../types'

export const GET_PER_DIEM_RATES = gql`
  query GetPerDiemRates {
    perDiemRates {
      countryCode
      countryNameSr
      dailyAmount
      currency
    }
  }
`

export function usePerDiemRates() {
  return useQuery<GetPerDiemRatesQuery>(GET_PER_DIEM_RATES)
}

export function useCalculatePerDiem() {
  return useMutation({
    mutationFn: (data: PerDiemCalculationRequest) =>
      httpClient.post<PerDiemCalculationResponse>('/per-diem/calculate', data),
  })
}

export function useCalculateAndSavePerDiem() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (data: PerDiemCalculationRequest) =>
      httpClient.post<PerDiemCalculationResponse>(
        '/per-diem/calculate-and-save',
        data
      ),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: ['GetRoute'] })
      toast.success(t('common:success.saved'))
    },
  })
}
