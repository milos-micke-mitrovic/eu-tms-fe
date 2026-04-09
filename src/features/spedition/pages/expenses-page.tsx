import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { usePageTitle } from '@/shared/hooks'
import { PageHeader } from '@/shared/components'
import { useExpenseSummary } from '../api/use-expenses'
import { ExpenseCategoryChart } from '../components/expense-category-chart'
import { ExpenseTrendChart } from '../components/expense-trend-chart'

// PARTIAL: BE Sprint 3 — charts ready, GraphQL expenseSummary query not yet in BE

function getDefaultRange() {
  const now = new Date()
  const from = startOfMonth(subMonths(now, 5))
  const to = endOfMonth(now)
  return {
    from: format(from, 'yyyy-MM-dd'),
    to: format(to, 'yyyy-MM-dd'),
  }
}

export function ExpensesPage() {
  const { t } = useTranslation('spedition')
  usePageTitle(t('expenses.title'))

  const [range] = useState(getDefaultRange)

  const { data: categoryData, loading: categoryLoading } = useExpenseSummary(range.from, range.to, 'CATEGORY')
  const { data: monthlyData, loading: monthlyLoading } = useExpenseSummary(range.from, range.to, 'MONTH')

  return (
    <div className="space-y-6">
      <PageHeader title={t('expenses.title')} />
      <div className="grid gap-6 lg:grid-cols-2">
        <ExpenseCategoryChart
          data={categoryData?.expenseSummary ?? []}
          isLoading={categoryLoading}
        />
        <ExpenseTrendChart
          data={monthlyData?.expenseSummary ?? []}
          isLoading={monthlyLoading}
        />
      </div>
    </div>
  )
}
