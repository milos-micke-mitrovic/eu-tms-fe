import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { usePageTitle } from '@/shared/hooks'
import { PageHeader } from '@/shared/components'
import { H4, Caption } from '@/shared/ui/typography'
import { formatCurrency } from '@/shared/utils'
import { useExpenseSummary } from '../api/use-expenses'
import { ExpenseCategoryChart } from '../components/expense-category-chart'
import { ExpenseTrendChart } from '../components/expense-trend-chart'
import { ExpenseVehicleChart } from '../components/expense-vehicle-chart'

function getDefaultRange() {
  const now = new Date()
  return {
    from: format(startOfMonth(subMonths(now, 5)), 'yyyy-MM-dd'),
    to: format(endOfMonth(now), 'yyyy-MM-dd'),
  }
}

export function ExpensesPage() {
  const { t } = useTranslation('spedition')
  usePageTitle(t('expenses.title'))

  const [range] = useState(getDefaultRange)

  const { data: categoryData, loading: catLoading } = useExpenseSummary(range.from, range.to, 'CATEGORY')
  const { data: monthlyData, loading: monthLoading } = useExpenseSummary(range.from, range.to, 'MONTH')
  const { data: vehicleData, loading: vehLoading } = useExpenseSummary(range.from, range.to, 'VEHICLE')

  const totalExpenses = categoryData?.expenseSummary?.reduce((sum, i) => sum + i.totalAmountRsd, 0) ?? 0
  const categoryCount = categoryData?.expenseSummary?.length ?? 0

  return (
    <div className="space-y-6">
      <PageHeader title={t('expenses.title')} />

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <Caption className="text-muted-foreground">{t('expenses.total')}</Caption>
          <H4>{formatCurrency(totalExpenses, 'RSD')}</H4>
        </div>
        <div className="rounded-lg border p-4">
          <Caption className="text-muted-foreground">{t('expenses.category')}</Caption>
          <H4>{categoryCount}</H4>
        </div>
        <div className="rounded-lg border p-4">
          <Caption className="text-muted-foreground">{t('expenses.avgPerCategory')}</Caption>
          <H4>{categoryCount > 0 ? formatCurrency(totalExpenses / categoryCount, 'RSD') : '—'}</H4>
        </div>
      </div>

      {/* Row 1: Pie + empty space or summary */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ExpenseCategoryChart data={categoryData?.expenseSummary ?? []} isLoading={catLoading} />
        <ExpenseVehicleChart data={vehicleData?.expenseSummary ?? []} isLoading={vehLoading} />
      </div>

      {/* Row 2: Trend */}
      <ExpenseTrendChart data={monthlyData?.expenseSummary ?? []} isLoading={monthLoading} />
    </div>
  )
}
