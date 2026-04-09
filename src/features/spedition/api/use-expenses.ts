import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { httpClient } from '@/shared/api/http-client'
import { apolloClient } from '@/shared/api/apollo-client'
import type { ExpenseRequest, ExpenseSummaryItem } from '../types'

// PARTIAL: BE Sprint 3 — queries/mutations defined per CLAUDE.md, not yet in BE

export const GET_EXPENSE_SUMMARY = gql`
  query ExpenseSummary($from: Date!, $to: Date!, $groupBy: String!) {
    expenseSummary(from: $from, to: $to, groupBy: $groupBy) {
      key
      totalAmountRsd
    }
  }
`

type ExpenseSummaryResult = {
  expenseSummary: ExpenseSummaryItem[]
}

export function useExpenseSummary(from: string, to: string, groupBy: string) {
  return useQuery<ExpenseSummaryResult>(GET_EXPENSE_SUMMARY, {
    variables: { from, to, groupBy },
  })
}

export function useCreateExpense() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (data: ExpenseRequest) =>
      httpClient.post('/expenses', data),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: ['GetRoute', 'GetRoutes', 'ExpenseSummary', 'Dashboard'] })
      toast.success(t('common:success.created'))
    },
  })
}

export function useDeleteExpense() {
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: number) => httpClient.delete(`/expenses/${id}`),
    onSuccess: () => {
      apolloClient.refetchQueries({ include: ['GetRoute', 'GetRoutes', 'ExpenseSummary', 'Dashboard'] })
      toast.success(t('common:success.deleted'))
    },
  })
}
