import { useTranslation } from 'react-i18next'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Inbox } from 'lucide-react'
import { BodySmall } from '@/shared/ui/typography'
import { Skeleton } from '@/shared/ui/skeleton'
import { formatCurrency } from '@/shared/utils'
import type { ExpenseSummaryItem } from '../types'

type ExpenseTrendChartProps = {
  data: ExpenseSummaryItem[]
  isLoading: boolean
}

export function ExpenseTrendChart({ data, isLoading }: ExpenseTrendChartProps) {
  const { t } = useTranslation('spedition')

  const chartData = data.map((item) => ({
    name: item.key,
    total: item.totalAmountRsd,
  }))

  return (
    <div className="rounded-lg border p-4">
      <BodySmall className="mb-4 font-medium">{t('expenses.trend')}</BodySmall>
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : chartData.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 py-12">
          <div className="bg-muted rounded-full p-3">
            <Inbox className="text-muted-foreground size-6" />
          </div>
          <BodySmall className="font-medium">
            {t('common:table.noData')}
          </BodySmall>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value), 'RSD')}
            />
            <Bar
              dataKey="total"
              fill="hsl(173, 80%, 40%)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
