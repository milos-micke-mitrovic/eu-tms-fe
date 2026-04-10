import { useTranslation } from 'react-i18next'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Inbox } from 'lucide-react'
import { BodySmall, Caption } from '@/shared/ui/typography'
import { Skeleton } from '@/shared/ui/skeleton'
import { formatCurrency } from '@/shared/utils'
import type { ExpenseSummaryItem } from '../types'

type ExpenseVehicleChartProps = {
  data: ExpenseSummaryItem[]
  isLoading: boolean
}

export function ExpenseVehicleChart({ data, isLoading }: ExpenseVehicleChartProps) {
  const { t } = useTranslation('spedition')

  const chartData = data
    .sort((a, b) => b.totalAmountRsd - a.totalAmountRsd)
    .slice(0, 10)
    .map((item) => ({ name: item.key, total: item.totalAmountRsd }))

  return (
    <div className="rounded-lg border p-4">
      <BodySmall className="mb-4 font-medium">{t('expenses.topVehicles')}</BodySmall>
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : chartData.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2">
          <Inbox className="text-muted-foreground size-8" />
          <Caption className="text-muted-foreground">{t('common:table.noData')}</Caption>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
            <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => formatCurrency(Number(value), 'RSD')} />
            <Bar dataKey="total" fill="hsl(173, 80%, 40%)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
