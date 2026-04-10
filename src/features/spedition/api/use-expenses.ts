import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { httpClient } from '@/shared/api/http-client'
import { apolloClient } from '@/shared/api/apollo-client'
import type { ExpenseSummaryQuery } from '@/generated/graphql'
import type { ExpenseRequest } from '../types'

export const GET_EXPENSE_SUMMARY = gql`
  query ExpenseSummary($from: Date!, $to: Date!, $groupBy: String!) {
    expenseSummary(from: $from, to: $to, groupBy: $groupBy) {
      key
      totalAmountRsd
    }
  }
`

export function useExpenseSummary(from: string, to: string, groupBy: string) {
  return useQuery<ExpenseSummaryQuery>(GET_EXPENSE_SUMMARY, {
    variables: { from, to, groupBy },
    skip: !from || !to,
  })
}

export function useCreateExpense() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (data: ExpenseRequest) => httpClient.post('/expenses', data),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: ['GetRoute', 'ExpenseSummary'] })
      toast.success(t('common:success.created'))
    },
  })
}

export function useUpdateExpense() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExpenseRequest }) =>
      httpClient.put(`/expenses/${id}`, data),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: ['GetRoute', 'ExpenseSummary'] })
      toast.success(t('common:success.saved'))
    },
  })
}

export function useDeleteExpense() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => httpClient.delete(`/expenses/${id}`),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: ['GetRoute', 'ExpenseSummary'] })
      toast.success(t('common:success.deleted'))
    },
  })
}
