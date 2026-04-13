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
import { ExpandableChartCard, useChartExpanded } from '@/shared/components'
import { formatCurrency } from '@/shared/utils'
import type { ExpenseSummaryItem } from '../types'

type ExpenseVehicleChartProps = {
  data: ExpenseSummaryItem[]
  isLoading: boolean
}

function VehicleBarChart({
  chartData,
}: {
  chartData: { name: string; total: number }[]
}) {
  const expanded = useChartExpanded()
  return (
    <ResponsiveContainer
      width="100%"
      height={expanded ? Math.max(400, chartData.length * 60) : 300}
    >
      <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={100}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          cursor={false}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const item = payload[0]
            return (
              <div className="bg-popover rounded-md border px-3 py-2 text-sm shadow-md">
                <p className="text-muted-foreground text-xs">
                  {item.payload.name}
                </p>
                <p className="font-medium">
                  {formatCurrency(Number(item.value), 'RSD')}
                </p>
              </div>
            )
          }}
        />
        <Bar dataKey="total" fill="hsl(173, 80%, 40%)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function ExpenseVehicleChart({
  data,
  isLoading,
}: ExpenseVehicleChartProps) {
  const { t } = useTranslation('spedition')

  const chartData = [...data]
    .sort((a, b) => b.totalAmountRsd - a.totalAmountRsd)
    .slice(0, 10)
    .map((item) => ({ name: item.key, total: item.totalAmountRsd }))

  return (
    <ExpandableChartCard title={t('expenses.topVehicles')}>
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
        <VehicleBarChart chartData={chartData} />
      )}
    </ExpandableChartCard>
  )
}
