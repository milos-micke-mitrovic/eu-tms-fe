import { useTranslation } from 'react-i18next'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { BodySmall } from '@/shared/ui/typography'
import { formatCurrency } from '@/shared/utils'
import type { ExpenseSummaryItem } from '../types'

const COLORS = [
  'hsl(173, 80%, 40%)', // teal (primary)
  'hsl(220, 70%, 50%)',
  'hsl(280, 60%, 55%)',
  'hsl(340, 75%, 55%)',
  'hsl(40, 90%, 50%)',
  'hsl(100, 60%, 40%)',
  'hsl(200, 70%, 45%)',
  'hsl(320, 65%, 50%)',
]

type ExpenseCategoryChartProps = {
  data: ExpenseSummaryItem[]
  isLoading: boolean
}

export function ExpenseCategoryChart({ data, isLoading }: ExpenseCategoryChartProps) {
  const { t } = useTranslation('spedition')

  const chartData = data.map((item) => ({
    name: t(`expenses.categories.${item.key}`, { defaultValue: item.key }),
    value: item.totalAmountRsd,
  }))

  return (
    <div className="rounded-lg border p-4">
      <BodySmall className="mb-4 font-medium">{t('common:dashboard.expensesByCategory', { defaultValue: 'Troškovi po kategorijama' })}</BodySmall>
      {isLoading ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">{t('common:app.loading')}</div>
      ) : chartData.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">{t('common:table.noData')}</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
              {chartData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(Number(value), 'RSD')} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
