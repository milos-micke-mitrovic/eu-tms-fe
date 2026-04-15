import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { useMutation } from '@tanstack/react-query'
import { httpClient } from '@/shared/api/http-client'
import type { GetExchangeRatesQuery } from '@/generated/graphql'

export const GET_EXCHANGE_RATES = gql`
  query GetExchangeRates($date: Date) {
    exchangeRates(date: $date) {
      currencyCode
      rateToRsd
      rateDate
    }
  }
`

export function useExchangeRates(date?: string) {
  return useQuery<GetExchangeRatesQuery>(GET_EXCHANGE_RATES, {
    variables: date ? { date } : {},
  })
}

type ConvertCurrencyRequest = {
  amount: number
  fromCurrency: string
  toCurrency: string
  date?: string
}

type ConvertCurrencyResponse = {
  originalAmount: number
  fromCurrency: string
  toCurrency: string
  convertedAmount: number | null
  exchangeRate: number | null
  rateDate: string
}

export function useConvertCurrency() {
  return useMutation({
    mutationFn: (data: ConvertCurrencyRequest) =>
      httpClient.post<ConvertCurrencyResponse>('/exchange-rates/convert', data),
  })
}

type ManualRateRequest = {
  currencyCode: string
  rateToRsd: number
  rateDate: string
}

export function useManualRateEntry() {
  return useMutation({
    mutationFn: (data: ManualRateRequest) =>
      httpClient.post('/exchange-rates/manual', data),
  })
}

export function useFetchNbsRates() {
  return useMutation({
    mutationFn: () => httpClient.post('/exchange-rates/fetch'),
  })
}
